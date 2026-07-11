// ======================
// LOADER
// ======================

window.addEventListener("load", () => {

    const loader = document.getElementById("loader")

    setTimeout(() => {

        loader.style.opacity = "0"

        setTimeout(() => {

            loader.style.display = "none"

        }, 500)

    }, 1200)

})

// ======================
// MOBILE MENU
// ======================

const menuBtn =
document.getElementById("menuBtn")

const navMenu =
document.getElementById("navMenu")

if(menuBtn){

    menuBtn.addEventListener("click", () => {

        navMenu.classList.toggle("active")

    })

}

// ======================
// CLOSE MENU
// ======================

document.querySelectorAll("#navMenu a")
.forEach(link => {

    link.addEventListener("click", () => {

        navMenu.classList.remove("active")

    })

})

// ======================
// TOP BUTTON
// ======================

const topBtn =
document.getElementById("topBtn")

window.addEventListener("scroll", () => {

    if(window.scrollY > 400){

        topBtn.style.display = "block"

    } else {

        topBtn.style.display = "none"

    }

})

topBtn.addEventListener("click", () => {

    window.scrollTo({

        top:0,
        behavior:"smooth"

    })

})

// ======================
// NAVBAR EFFECT
// ======================

const navbar =
document.querySelector(".navbar")

window.addEventListener("scroll", () => {

    if(window.scrollY > 50){

        navbar.style.background =
        "rgba(0,0,0,.85)"

        navbar.style.backdropFilter =
        "blur(20px)"

    } else {

        navbar.style.background =
        "rgba(0,0,0,.35)"

    }

})

// ======================
// SCROLL REVEAL
// ======================

const observer =
new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if(entry.isIntersecting){

            entry.target.classList.add("show")

        }

    })

}, {

    threshold:0.15

})

document
.querySelectorAll(
".service-card,.panel-card,.section-title"
)
.forEach(el => {

    observer.observe(el)

})

// ======================
// PARALLAX HERO LOGO
// ======================

const heroLogo =
document.querySelector(".hero-logo")

if(heroLogo){

window.addEventListener("mousemove", e => {

    const x =
    (window.innerWidth / 2 - e.clientX) / 50

    const y =
    (window.innerHeight / 2 - e.clientY) / 50

    heroLogo.style.transform =
    `translate(${x}px,${y}px)`

})

}

// ======================
// CONSOLE BRANDING
// ======================

console.log(`
==========================
       IZZ STORE
==========================
Digital Marketplace
==========================
`)