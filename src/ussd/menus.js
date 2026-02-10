
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
    // 1️⃣ Affichage de la question
    if (!input) {
      return {
        text: "Question 1:\nVeuillez saisir votre réponse",
        nextStep: "QUIZ_Q1",
        end: false
      };
    }

    // 2️⃣ Réponse utilisateur
    session.data.q1 = input.trim();

    return {
      text: "",
      nextStep: "QUIZ_Q2",
      end: false
    };
  }
},

  // QUESTION 2
  QUIZ_Q2: {
      handler: async (session, input) => {
        if (!input) {
          return {
            text: "Question 2:\nVeuillez saisir votre réponse",
            nextStep: "QUIZ_Q2",
            end: false
          };
        }

        session.data.q2 = input.trim();

        return {
          text: "Merci pour votre participation !",
          nextStep: null,
          end: true
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
