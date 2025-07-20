import { useState, useEffect } from 'react';

interface Verse {
  text: string;
  reference: string;
}

const BIBLE_VERSES: Verse[] = [
  {
    text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
    reference: "João 3:16"
  },
  {
    text: "Tudo posso naquele que me fortalece.",
    reference: "Filipenses 4:13"
  },
  {
    text: "O Senhor é o meu pastor; nada me faltará.",
    reference: "Salmo 23:1"
  },
  {
    text: "Entrega o teu caminho ao Senhor; confia nele, e ele o fará.",
    reference: "Salmo 37:5"
  },
  {
    text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.",
    reference: "Romanos 8:28"
  },
  {
    text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.",
    reference: "Isaías 41:10"
  },
  {
    text: "Aquieta-te perante o Senhor e espera nele; não te indignes por causa daquele que prospera em seu caminho.",
    reference: "Salmo 37:7"
  },
  {
    text: "Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.",
    reference: "1 Pedro 5:7"
  },
  {
    text: "O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; de quem me recearei?",
    reference: "Salmo 27:1"
  },
  {
    text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.",
    reference: "Jeremias 29:11"
  },
  {
    text: "Mas os que esperam no Senhor renovarão as suas forças, subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.",
    reference: "Isaías 40:31"
  },
  {
    text: "Deleita-te também no Senhor, e ele te concederá os desejos do teu coração.",
    reference: "Salmo 37:4"
  },
  {
    text: "Porque onde estiver o vosso tesouro, aí estará também o vosso coração.",
    reference: "Mateus 6:21"
  },
  {
    text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
    reference: "Mateus 11:28"
  },
  {
    text: "Não se turbe o vosso coração; credes em Deus, crede também em mim.",
    reference: "João 14:1"
  },
  {
    text: "E o Deus de toda a graça, que em Cristo Jesus vos chamou à sua eterna glória, depois de haveres padecido um pouco, ele mesmo vos aperfeiçoe, confirme, fortifique e estabeleça.",
    reference: "1 Pedro 5:10"
  },
  {
    text: "Humilhai-vos perante o Senhor, e ele vos exaltará.",
    reference: "Tiago 4:10"
  },
  {
    text: "Porque pela graça sois salvos, por meio da fé; e isto não vem de vós; é dom de Deus.",
    reference: "Efésios 2:8"
  },
  {
    text: "E eis que estou convosco todos os dias, até a consumação dos séculos.",
    reference: "Mateus 28:20"
  },
  {
    text: "A palavra de Deus é viva e eficaz, e mais penetrante do que espada alguma de dois gumes.",
    reference: "Hebreus 4:12"
  }
];

export function useDailyVerse() {
  const [currentVerse, setCurrentVerse] = useState<Verse>(() => {
    // Generate a deterministic index based on the current date and time
    // This ensures different verses on different page loads
    const now = new Date();
    const seed = now.getDate() + now.getHours() + now.getMinutes() + Math.floor(Math.random() * 1000);
    const index = seed % BIBLE_VERSES.length;
    return BIBLE_VERSES[index];
  });

  // Function to get a new random verse
  const getNewVerse = () => {
    const randomIndex = Math.floor(Math.random() * BIBLE_VERSES.length);
    const newVerse = BIBLE_VERSES[randomIndex];
    setCurrentVerse(newVerse);
    return newVerse;
  };

  // Function to share the verse
  const shareVerse = () => {
    const shareText = `"${currentVerse.text}" - ${currentVerse.reference}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Versículo do Dia - OrLev',
        text: shareText,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        return true; // Return success indication for toast
      }).catch(() => {
        return false;
      });
    }
  };

  return {
    currentVerse,
    getNewVerse,
    shareVerse,
    totalVerses: BIBLE_VERSES.length
  };
}