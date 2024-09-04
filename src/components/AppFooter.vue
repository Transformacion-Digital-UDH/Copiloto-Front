<template>
    <footer class="bg-azul shadow-md font-Roboto w-full border-t border-gray-200">
      <div class="max-w-screen-xl mx-auto p-4 md:py-8 flex flex-col md:flex-row justify-between items-center">
        <!-- Botones de Redes Sociales -->
        <div class="flex justify-center md:justify-start mb-4 md:mb-0 space-x-4">
          <a href="https://www.facebook.com" class="icon facebook" title="Facebook" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a href="https://www.twitter.com" class="icon twitter" title="Twitter" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-twitter"></i>
          </a>
          <a href="https://www.instagram.com" class="icon instagram" title="Instagram" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-instagram"></i>
          </a>
        </div>
        
        <!-- Enlaces del pie de página -->
        <div class="text-center md:text-left">
          <ul class="flex flex-col md:flex-row text-sm font-medium text-white space-y-2 md:space-y-0 md:space-x-6">
            <li>
              <a href="#" class="hover:underline">Sobre Nosotros</a>
            </li>
            <li>
              <a href="#" class="hover:underline">Política de Privacidad</a>
            </li>
            <li>
              <a href="#" class="hover:underline">Licencias</a>
            </li>
            <li>
              <a href="#" class="hover:underline">Contacto</a>
            </li>
          </ul>
        </div>
      </div>
  
      <!-- Derechos Reservados -->
      <div class="max-w-screen-xl mx-auto p-4 text-center border-t border-gray-200">
        <span class="block text-sm text-white">
          © 2024 <a href="#" class="hover:underline">Mi Proyecto VueJS ™</a>. Todos los Derechos Reservados.
        </span>
      </div>
    </footer>
  </template>
  
  <style scoped>
  .icon {
    background: #fff;
    border-radius: 50%;
    margin: 0 10px;
    width: 50px;
    height: 50px;
    font-size: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s, background 0.3s;
  }
  
  .icon:hover {
    transform: translateY(-5px);
  }
  
  .facebook:hover {
    background: #1877f2;
    color: #fff;
  }
  
  .twitter:hover {
    background: #1da1f2;
    color: #fff;
  }
  
  .instagram:hover {
    background: #F58529;
    color: #fff;
  }
  
  @media (min-width: 768px) {
    footer {
      font-size: 1rem; /* Ajusta el tamaño de fuente para pantallas grandes */
    }
  }
  </style>
  