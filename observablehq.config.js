// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Stopped: An Analysis of Traffic-Stops by Race in North Carolina",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    {name: "Stopped and Searched", path: "/02 Stopped and Searched"},
    {name: "Hidden in Darkness", path: "/02 3Hidden in Darkness"},
    {name: "Punished Unequally", path: "/04 Punished Unequally"},
    {name: "What the Data Reveals", path: "/05 What the Data Reveals"},
  ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "src",

  // Change theme
  theme: "light",

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)

  header: '<div style="background: #43666bff; color: white; padding: 10px; text-align: center;">Raleigh Traffic Stop Analysis 2011-2015</div>', 

  // footer: "Built with Observable.", // what to show in the footer (HTML)
  footer: "Investigating traffic stop disparities in Raleigh, NC | Stanford Open Policing Project",
  // sidebar: true, // whether to show the sidebar
  sidebar: true,
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  typographer: false,
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
};
