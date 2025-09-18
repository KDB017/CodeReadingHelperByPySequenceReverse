#!/usr/bin/env node

"use strict";    // このJavaScriptコードを「strict mode」で実行します。

/**
 * handle clickevent
 */

console.log("main.js loaded");

/**
 * Extracts the function name from the raw text content of a message.
 * @param  raw raw text content of message
 * @returns extracted function name
 */
function extractFn(raw) {
  const colonIndex = raw.indexOf(":");
  let fn = raw.substring(colonIndex + 1);
  fn = fn.substring(0, fn.indexOf("("));
  return fn.trim();
}

import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

const vscode = acquireVsCodeApi();

export function extractFn(raw) {
  const colonIndex = raw.indexOf(":");
  if (colonIndex === -1) return "";
  let fn = raw.substring(colonIndex + 1);
  const parenIndex = fn.indexOf("(");
  if (parenIndex !== -1) fn = fn.substring(0, parenIndex);
  return fn.trim();
}

mermaid.initialize({ startOnLoad: true, theme: 'forest' });

mermaid.run().then(() => {
  const counts = {};
  const elements = document.querySelectorAll('.messageText');

  elements.forEach(el => {
    const fn = extractFn(el.textContent);
    if (!fn) return;
    counts[fn] = (counts[fn] || 0) + 1;
  });

  elements.forEach(el => {
    const fn = extractFn(el.textContent);
    if (!fn) return;

    if (counts[fn] >= 3) {
      el.style.fill = "red";
    }

    el.classList.add('clickable');
    el.addEventListener('click', () => {
      vscode.postMessage({
        command: 'jumpToFunction',
        functionName: fn,
      });
    });
  });
});
