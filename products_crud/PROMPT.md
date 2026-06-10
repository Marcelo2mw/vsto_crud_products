This is a VSTO Excel Workbook project (.NET Framework 4.8, C#). I want a CRUD form to manage product records stored in the Sheet1 worksheet. The form's frontend is an HTML + CSS + JavaScript UI hosted inside a WebView2 control. Please implement the CRUD operations using bidirectional JavaScript ↔ C# communication (WebView2 postMessage / WebMessageReceived).

Existing setup:

The WebView2 control is already on the form; the code that loads the HTML into it lives in @Crud_products.cs — extend that file, don't recreate it.
The frontend files (index.html, script.js, style.css) are in the frontend folder. Note that index.html is a self-unpacking bundle that loads script.js and style.css as external files — edit those, not the bundle.
Newtonsoft.Json is already referenced; use it for all serialization.
Data model (one product per row): nome, sku, categoria, marca, precoCents (price as integer cents), qtd (stock), status (Active/Inactive), descricao, img, plus a unique id. The exact field IDs are in frontend/script.js.

Worksheet layout: Row 1 = headers (Id, Nome, SKU, Categoria, Marca, PrecoCents, Qtd, Status, Descricao, Imagem), data from row 2 down. Create the headers automatically if the sheet is empty. New products go to the top.

Images: Save image files to a local folder (%LocalAppData%\ExcelWorkbook10\images), named by product id. Store only the file name in the worksheet. The form must display thumbnails/previews, so expose the folder to the WebView via SetVirtualHostNameToFolderMapping (e.g. https://app-images/<file>).

Requirements:

Define a request/response message protocol (request id, action, payload; success/error response) and document it.
The JS layer must replace any current client-side persistence (e.g. localStorage) and call into C# instead.
Handle create / read (list) / update / delete, including adding, replacing, and removing the image.
Surface backend errors back to the UI.
Keep the existing UI/UX untouched; only swap the data layer.
Build the project at the end and confirm it compiles (note: Globals.Sheet1 is only populated at runtime, so flag anything you couldn't verify without running Excel).