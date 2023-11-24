export default `
<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>foliate.js</title>
    <script id="foliate"></script>
    <script id="pdf"></script>

    <style type="text/css">

      html {
        height: 100%;
        width: 100%;
        display: flex;
        overflow: hidden !important;
        justify-content: center;
        align-items: center;
      }
      body {
        margin: 0 auto;
        height: 100%;
        font: menu;
        font-family: system-ui, sans-serif;
        background: var(--bg);
        color: var(--fg);
      }

      foliate-view::part(head), foliate-view::part(foot) {
          font-family: system-ui;
          font-size: 9pt;
      }
      foliate-view {
          --overlayer-highlight-blend-mode: var(--mode);
      }
    </style>
  </head>

  <body oncopy='return false' oncut='return false'>
    <script>
    var reader;
    var pdfjsLib = window["pdfjs-dist/build/pdf"];
    pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdf.worker.js";

      const bookPath = undefined;
      const bookLocation = undefined;

      try {
        reader = new foliate(bookPath, bookLocation);
      } catch (err) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: "epubjs", message: "[INDEX_HTML] ERROR " + err })
        );
      }

    </script>
  </body>
</html>
`;
