// ***** Texto que se escribe automáticamente (efecto de máquina de escribir) ********
import { ref } from "vue";

export function useTypewriter(text: string, delay = 80) {
  const textoTipiado = ref("");
  let index = 0;

  const typeWriter = () => {
    if (index < text.length){
      textoTipiado.value += text.charAt(index);
      index++;
      setTimeout(typeWriter, delay);
    }
  };
  return {textoTipiado, typeWriter};
}