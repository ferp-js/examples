import jsdom from 'jsdom';

const { window } = new jsdom.JSDOM('<!doctype html><html lang="en"><body></body></html>');
global.window = window;
global.document = window.document;
