/* Мини-клиент GitHub API для админки: чтение файла, история, публикация нескольких файлов одним коммитом.
   Работает в браузере (window.GH) и в Node 18+ (module.exports) для самопроверки. */
(function (root) {
  'use strict';
  var API = 'https://api.github.com';

  function bytesToB64(bytes) {
    var s = '', chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    return btoa(s);
  }
  function b64ToBytes(b64) {
    var s = atob(String(b64).replace(/\s/g, '')), out = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
  function textToB64(text) { return bytesToB64(new TextEncoder().encode(text)); }
  function b64ToText(b64) { return new TextDecoder().decode(b64ToBytes(b64)); }
  function encPath(p) { return String(p).split('/').map(encodeURIComponent).join('/'); }

  function GH(opts) {
    this.token = opts.token;
    this.owner = opts.owner;
    this.repo = opts.repo;
    this.branch = opts.branch || 'main';
  }

  GH.prototype.req = async function (method, path, body) {
    var res;
    try {
      res = await fetch(API + path, {
        method: method,
        cache: 'no-store',
        headers: {
          Authorization: 'Bearer ' + this.token,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (e) {
      var ne = new Error('network'); ne.code = 'network'; throw ne;
    }
    var data = null;
    try { data = await res.json(); } catch (e) { /* пустой ответ */ }
    if (!res.ok) {
      var err = new Error((data && data.message) || ('HTTP ' + res.status));
      err.status = res.status; err.data = data;
      throw err;
    }
    return data;
  };

  GH.prototype.base = function () { return '/repos/' + this.owner + '/' + this.repo; };
  GH.prototype.user = function () { return this.req('GET', '/user'); };
  GH.prototype.repoInfo = function () { return this.req('GET', this.base()); };

  GH.prototype.readFile = async function (path, ref) {
    var d = await this.req('GET', this.base() + '/contents/' + encPath(path) + '?ref=' + encodeURIComponent(ref || this.branch));
    return { text: b64ToText(d.content || ''), sha: d.sha };
  };

  GH.prototype.history = async function (path, n) {
    var list = await this.req('GET', this.base() + '/commits?path=' + encodeURIComponent(path) + '&sha=' + encodeURIComponent(this.branch) + '&per_page=' + (n || 15));
    return list.map(function (c) {
      return { sha: c.sha, message: c.commit.message, date: c.commit.author.date, author: c.commit.author.name, url: c.html_url };
    });
  };

  /* files: [{path, b64}]. expect: {path, sha} — если файл на ветке уже другой, коммит не делаем (конфликт). */
  GH.prototype.commitFiles = async function (files, message, expect) {
    var b = this.base();
    var ref = await this.req('GET', b + '/git/ref/heads/' + encodeURIComponent(this.branch));
    var head = ref.object.sha;
    if (expect && expect.sha) {
      var cur = await this.req('GET', b + '/contents/' + encPath(expect.path) + '?ref=' + head);
      if (cur.sha !== expect.sha) { var ce = new Error('conflict'); ce.code = 'conflict'; throw ce; }
    }
    var commit = await this.req('GET', b + '/git/commits/' + head);
    var tree = [], shas = {};
    for (var i = 0; i < files.length; i++) {
      var blob = await this.req('POST', b + '/git/blobs', { content: files[i].b64, encoding: 'base64' });
      shas[files[i].path] = blob.sha;
      tree.push({ path: files[i].path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    var newTree = await this.req('POST', b + '/git/trees', { base_tree: commit.tree.sha, tree: tree });
    var newCommit = await this.req('POST', b + '/git/commits', { message: message, tree: newTree.sha, parents: [head] });
    try {
      await this.req('PATCH', b + '/git/refs/heads/' + encodeURIComponent(this.branch), { sha: newCommit.sha, force: false });
    } catch (e) {
      if (e.status === 422 || e.status === 409) { var fe = new Error('conflict'); fe.code = 'conflict'; throw fe; }
      throw e;
    }
    return { commit: newCommit.sha, url: newCommit.html_url, shas: shas };
  };

  GH.bytesToB64 = bytesToB64;
  GH.b64ToBytes = b64ToBytes;
  GH.textToB64 = textToB64;
  GH.b64ToText = b64ToText;

  if (typeof module !== 'undefined' && module.exports) module.exports = GH;
  else root.GH = GH;
})(typeof self !== 'undefined' ? self : this);
