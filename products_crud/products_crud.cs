using Microsoft.Web.WebView2.Core;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace products_crud
{
    public partial class products_crud: Form
    {
        public products_crud()
        {
            InitializeComponent();
            IniciarWebview();
        }

        private async void IniciarWebview()
        {
            try
            {
                string userDataFolder = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "crud_products"
                );

                var environment = await CoreWebView2Environment.CreateAsync(
                    browserExecutableFolder: null,
                    userDataFolder: userDataFolder
                );

                await webView21.EnsureCoreWebView2Async(environment);

                string filePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "frontend", "index.html");

                if (File.Exists(filePath))
                {
                    webView21.CoreWebView2.Navigate(new Uri(filePath).AbsoluteUri);
                    webView21.CoreWebView2.Settings.IsStatusBarEnabled = false;
                }

            }
            catch (Exception)
            {

            }
        }

    }
}
