
module.exports = {
  // PAGE D'ACCUEIL
  HOME: {
    handler: async (session, input) => {
      // Si l'utilisateur n'a pas encore saisi, juste afficher le menu
      if (!input) {
        return {
          text: "1. Airtel Quiz\n2. Infos",
          nextStep: "HOME", // reste sur HOME pour attendre la réponse
          end: false
        };
      }

      // Normaliser l'input
      const choice = input.trim();

      // Déterminer la prochaine étape
      const nextStep = choice === "1" ? "QUIZ_Q1" : "INFO";

      return {
        text: "", // le texte sera récupéré par le router depuis nextStep.handler
        nextStep,
        end: false
      };
    }
  },

  // QUESTION 1
  QUIZ_Q1: {
    handler: async (session, input) => {
      if (input) session.data.q1 = input;

      return {
        text: "Question 1:\nVeuillez saisir votre réponse",
        nextStep: "QUIZ_Q2",
        end: false
      };
    }
  },

  // QUESTION 2
  QUIZ_Q2: {
    handler: async (session, input) => {
      if (input) session.data.q2 = input;

      // Appel API pour personnaliser le message final (optionnel) 
      // try {
      //   const response = await fetch(
      //     "https://api.example.com/ussd-message?q2=" + encodeURIComponent(input || "")
      //   );
      //   const data = await response.json();
      //   if (data?.message) message = data.message;
      // } catch (err) {
      //   // Si erreur API, on continue avec message par défaut
      //   console.error("API call failed:", err);
      // }

      return {
        text: "Question 2:\nVeuillez saisir votre réponse",
        nextStep: "FINAL",
        end: false
      };
    }
  },

  // ÉCRAN FINAL
  FINAL: {
    handler: async () => ({
      text: "Merci pour votre participation !",
      nextStep: null,
      end: true
    })
  },

  // PAGE INFO
  INFO: {
    handler: async () => ({
      text: "Service Airtel Quiz.\nMerci.",
      nextStep: null,
      end: true
    })
  }
};
