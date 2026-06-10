using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Office.Tools.Ribbon;

namespace products_crud
{
    public partial class Ribbon1
    {
        products_crud crud = null;
        private void Ribbon1_Load(object sender, RibbonUIEventArgs e)
        {
            crud = new products_crud();
        }

        private void button1_Click(object sender, RibbonControlEventArgs e)
        {
            if (crud == null)
            {
                crud = new products_crud();
            }

            crud.ShowDialog();
        }
    }
}
