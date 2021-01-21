import { parseRequestUrl, rerender } from "../../utils";
import { getProduct } from "../api";
import { getCartItems, setCartItems } from "../localStorage";




const addToCart = (item, forceUpdate = false) => {
    let cartItems = getCartItems();
    const existItem = cartItems.find(x => x.product === item.product);
    if(existItem){

       if(forceUpdate){
         cartItems = cartItems.map((x) => 
         x.product === existItem.product ? item : x);

       }
    }else{
        cartItems = [...cartItems, item];

    }
    setCartItems(cartItems);

    if(forceUpdate){
       rerender(CartScreen);
    }

   
};



const removeFromCart = (id) => {
   setCartItems(getCartItems().filter(x => x.product !== id));
   if(id === parseRequestUrl().id){

      document.location.hash = '/cart';
   }else{
      rerender(CartScreen);
   }
}



const CartScreen = {
    after_render: () => {
       const qtySelects = document.getElementsByClassName('qty-select');
       Array.from(qtySelects).forEach((qtySelect) => {

          qtySelect.addEventListener('change', (e) => {
             const item = getCartItems().find((x) => x.product === qtySelect.id);
             addToCart({...item, qty: Number(e.target.value)}, true);
          });

       });

       const deleteButtons = document.getElementsByClassName('delete-button');
       Array.from(deleteButtons).forEach((deleteButton) => {
          deleteButton.addEventListener('click', () => {

            if(confirm('Deseja realmente deletar esse item?')){
               removeFromCart(deleteButton.id);

            }

          });

          document.getElementById('checkout-button').addEventListener('click', () => {
             document.location.hash = '/signin';
          });
       });

    },




    render: async() => {
        const request = parseRequestUrl();
        if(request.id){
            const product = await getProduct(request.id);

            addToCart({
                product: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                countInStock: product.countInStock,
                qty: 1,
            });
        };

        const cartItems = getCartItems();
        return ` 
        <div class="cart">

           <div class="cart-list">
               <ul class="cart-list-container">
                  <li style="border: none;">
                  <button class="go-back"> 
                      <i class="fas fa-chevron-left"></i>
                      <a href="/#/">Voltar</a>
                  </button>
                      <h3>Itens no carrinho</h3>
                      <h3>Preço unitário</h3>
                      <li style="border: none;">
                        ${
                          cartItems.length === 0 ?
                          '<div><h2>Carinho vazio</h2><p><a href="/#/">Ir às compras</a></p></div>' :
                          cartItems.map(item =>`
                           <li>
                              <div class="cart-image">
                                 <img src="${item.image}" alt="${item.name}"/>
                              </div>

                               <div class="cart-name">
                                  <div>
                                     <a href="/#/product/${item.product}">
                                       ${item.name}
                                     </a>
                                  </div>

                                  <div>
                                     Quantidade:
                                     <select class="qty-select" id="${item.product}">
                                        ${
                                           [...Array(item.countInStock).keys()].map(x =>
                                            item.qty === x + 1 ? `
                                            <option selected value="${x + 1}">${x + 1}</option>` : 
                                            `<option value="${x + 1}">${x + 1}</option>`
                                            )}
                                     </select>
                                     <button 
                                        type="button" 
                                        class="delete-button"
                                        id="${item.product}">
                                        Deletar
                                     </button>
                                  </div>
                               </div>

                               <div class="cart-price">
                                 R$ ${item.price}
                               </div>
                           </li>
                          `).join('\n')}
                      </li>
                  </li>
               </ul>
          </div>

           <div class="cart-action">
              <h3 style="margin-bottom: 2rem;">
                Subtotal: ${cartItems.reduce((accum, current) => accum + current.qty, 0)} itens 
              </h3>
             <div>
              Total a pagar:

              <h2 style="margin:1.5rem 0 0; color: #ffc000" >
                R$ ${cartItems.reduce((accum, current) => 
                accum + current.price * current.qty, 0).toFixed(2)} à vista 
              </h2>
      
             </div>
             <p style="margin-bottom: 3rem;">Ou em 6x sem juros</p>

              <button id="checkout-button" class="primary fw">
                Finalizar compra
                <i class="fas fa-cart-arrow-down"></i>
              </button>
           </div>
     
        </div>
        `;

    },
};


export default CartScreen;