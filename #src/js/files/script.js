window.onload = function () {
    document.addEventListener('click', documentActions)

    function documentActions(e) {
        const targetElelement = e.target
        if (window.innerWidth > 768 && isMobile.any()) {
            hideMenuOnSideTouch(targetElelement)
            toggleMenuListVisibility(targetElelement)
        }
        toggleSearchFieldVisibility(targetElelement)
        hideSearchFieldOnSideTouch(targetElelement)

        if (targetElelement.classList.contains('products__more')) {
            getProducts(targetElelement)
            e.preventDefault()
        }

        if (targetElelement.classList.contains('actions-product__button')) {
            const productId = targetElelement.closest('.item-product').dataset.pid
            addToCart(targetElelement, productId)
            e.preventDefault()
        }

        if (targetElelement.classList.contains('cart-header__icon') || targetElelement.closest('.cart-header__icon')) {
            if (document.querySelector('.cart-list').children.length > 0) {
                document.querySelector('.cart-header').classList.toggle('_active')
            }
            e.preventDefault()
        } else if (!targetElelement.classList.contains('cart-header__icon') && !targetElelement.closest('.cart-header__icon')) {
            document.querySelector('.cart-header').classList.remove('_active')
        }

        if (targetElelement.classList.contains('cart-list__delete')) {
            const productId = targetElelement.closest('.cart-list__item').dataset.cartPid
            updateCart(targetElelement, productId, false)
            e.preventDefault()
        }
    }

    function toggleMenuListVisibility(targetElelement) {
        if (targetElelement.classList.contains('menu__arrow')) {
            targetElelement.closest('.menu__item').classList.toggle('_hover')
        }
    }

    function toggleSearchFieldVisibility(targetElelement) {
        if (targetElelement.classList.contains('search-form__icon')) {
            targetElelement.closest('.search-form').classList.toggle('_active')
        }
    }

    function hideMenuOnSideTouch(targetElelement) {
        const hoveredMenuItems = document.querySelectorAll('.menu__item._hover')
        if (!targetElelement.closest('.menu__item') && hoveredMenuItems.length > 0) {
            _removeClasses(hoveredMenuItems, '_hover')
        }
    }

    function hideSearchFieldOnSideTouch(targetElelement) {
        const hoveredMenuItems = document.querySelector('.search-form._active')
        if (!targetElelement.closest('.search-form') && hoveredMenuItems) {
            hoveredMenuItems.classList.remove('_active')
        }
    }

    const headerElement = document.querySelector('.header')

    const headerScrollHandler = (entries, observer) => {
        if(entries[0].isIntersecting) {
            headerElement.classList.remove('_scroll')
            return
        }
        headerElement.classList.add('_scroll')
    }

    const headerObserver = new IntersectionObserver(headerScrollHandler)
    headerObserver.observe(headerElement)

    async function getProducts (button) {
        if (!button.classList.contains('hold')) {
            button.classList.add('hold')
            const file = 'json/products.json'

            let response = await fetch(file, {
                method: 'GET'
            })

            if (response.ok) {
                let { products } = await response.json()
                loadProducts(products)
                button.classList.remove('_hold')
                button.remove()
            }

            if (!response.ok) {
                console.error('Error')
            }
        }
    }

    function addToCart (productButton, productId) {
        if (!productButton.classList.contains('_hold')) {
            productButton.classList.add('_hold')
            productButton.classList.add('_fly')

            const cart = document.querySelector('.cart-header__icon')
            const product = document.querySelector(`[data-pid="${productId}"]`)
            const productImage = product.querySelector('.item-product__image')

            const productImageFly = productImage.cloneNode(true)

            const productImageFlyWidth = productImage.offsetWidth
            const productImageFlyHeight = productImage.offsetHeight
            const productImageFlyTop = productImage.getBoundingClientRect().top
            const productImageFlyLeft = productImage.getBoundingClientRect().left

            productImageFly.setAttribute('class', '_flyImage _ibg')
            productImageFly.style.cssText = `
                left: ${productImageFlyLeft}px;
                top: ${productImageFlyTop}px;
                width: ${productImageFlyWidth}px;
                height: ${productImageFlyHeight}px;
            `

            document.body.append(productImageFly)

            const cartFlyLeft = cart.getBoundingClientRect().left
            const cartFlyTop = cart.getBoundingClientRect().top
            productImageFly.style.cssText = `
                left: ${cartFlyLeft}px;
                top: ${cartFlyTop}px;
                width: 0px;
                height: 0px;
                opacity: 0;
            `

            productImageFly.addEventListener('transitionend', () => {
                if (productButton.classList.contains('_fly')) {
                    productImageFly.remove()
                    updateCart(productButton, productId)
                    productButton.classList.remove('_fly')
                }
            })
        }
    }

    function updateCart (productButton, productId, addProduct = true) {
        const cart = document.querySelector('.cart-header')
        const cartIcon = cart.querySelector('.cart-header__icon')
        const cartQuantity = cartIcon.querySelector('span')
        const cartProduct = document.querySelector(`[data-cart-pid="${productId}"]`)
        const cartList = document.querySelector('.cart-list')

        if (addProduct) {
            if (cartQuantity) {
                cartQuantity.innerHTML = ++cartQuantity.innerHTML
            }

            if (!cartQuantity) {
                cartIcon.insertAdjacentHTML('beforeend', '<span>1</span>')
            }

            cartProductList(cartProduct, productId, cartList)
            productButton.classList.remove('_hold')
            return
        }

        const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span')
        cartProductQuantity.innerHTML = --cartProductQuantity.innerHTML

        if (!parseInt(cartProductQuantity.innerHTML)) {
            cartProduct.remove()
        }

        const cartQuantityValue = --cartQuantity.innerHTML

        if (cartQuantityValue) {
            cartQuantity.innerHTML = cartQuantityValue
            return
        }
        cartQuantity.remove()
        cart.classList.remove('_active')
    }

    function cartProductList (cartProduct, productId, cartList) {
        if (!cartProduct) {
            const product = document.querySelector(`[data-pid="${productId}"]`)
            const cartProductImage = product.querySelector('.item-product__image').innerHTML
            const cartProductTitle = product.querySelector('.item-product__title').innerHTML
            const cartProductContent = `
                <a href="" class="cart-list__image _ibg">${cartProductImage}</a>
                <div class="cart-list__body">
                    <a href="" class="cart-list__title">${cartProductTitle}</a>
                    <div class="cart-list__quantity">Quantity: <span>1</span></div>
                    <a href="" class="cart-list__delete">Delete</a>
                </div>
            `
            cartList.insertAdjacentHTML('beforeend', `<li data-cart-pid="${productId}" class="cart-list__item">${cartProductContent}</li>`)
            return
        }
        const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span')
        cartProductQuantity.innerHTML = ++cartProductQuantity.innerHTML
    }

    function loadProducts (products) {
        const productsHTMLList = document.querySelector('.products__items')

        products.forEach(product => {
            const productTemplateStart = `<article data-pid="${product.id}" class="products__item item-product">`
            const productTemplateEnd = `</article>`

            let productTemplateLabels

            if (product.labels) {
                let productTemplateLabelsStart = `<div class="item-product__labels">`
                let productTemplateLabelsEnd = `</div>`

                let productTemplateLabelsContent = ''

                product.labels.forEach(labelItem => {
                    productTemplateLabelsContent += `<div class="item-product__label item-product__label_${labelItem.type}">${labelItem.value}</div>`
                })

                productTemplateLabels += productTemplateStart + productTemplateLabelsContent + productTemplateEnd
            }

                const productTemplateImage = `
                <a href="${product.url}" class="item-product__image _ibg">
                    <img src="img/products/${product.image}" alt="${product.title}">
                </a>`

                const productTemplateBodyStart = `<div class="item-product__body">`
                const productTemplateBodyEnd = `</div>`

                const productTemplateContent = `
                    <div class="item-product__content">
                        <h3 class="item-product__title">${product.title}</h3>
                        <div class="item-product__text">${product.text}</div>
                    </div>
                `

                let productTemplatePrices = ''
                const productTemplatePricesStart = `<div class="item-product__prices">`
                const productTemplatePricesCurrent = `<div class="item-product__price">Rp ${product.price}</div>`
                const productTemplatePricesOld = `<div class="item-product__price item-product__price_old">Rp ${product.priceOld}</div>`
                const productTemplatePricesEnd = `</div>`

                productTemplatePrices = productTemplatePricesStart + productTemplatePricesCurrent

                if (product.priceOld) {
                    productTemplatePrices += productTemplatePricesOld
                }

                productTemplatePrices += productTemplatePricesEnd

                const productTemplateActions = `
                <div class="item-product__actions actions-product">
                    <div class="actions-product__body">
                        <a href="" class="action-product__button btn btn_white">Add to card</a>
                        <a href="${product.shareUrl}" class="action-product__link _icon-share">Share</a>
                        <a href="${product.likeUrl}" class="action-product__link _icon-favorite">Like</a>
                    </div>
                </div>
                `

                const productTemplateBody = productTemplateBodyStart + productTemplateContent + productTemplatePrices + productTemplateActions + productTemplateBodyEnd
                const productTemplate = productTemplateStart + productTemplateLabels + productTemplateImage + productTemplateBody + productTemplateEnd
                productsHTMLList.insertAdjacentHTML('beforeend', productTemplate)
        })
    }
}