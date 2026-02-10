module.exports = {
  HOME: {
    handler: async (session, input) => ({
      text: "1. Airtel Quiz\n2. Infos",
      nextStep: input == "1" ? "QUIZ_Q1" : "INFO",
      end: false
    })
  },

  QUIZ_Q1: {
    handler: async (session, input) => {
      session.data.q1 = input;
      return {
        text: "Question 2:\nVeuillez saisir votre réponse",
        nextStep: "QUIZ_Q2",
        end: false
      };
    }
  },

  QUIZ_Q2: {
    handler: async (session, input) => {
      session.data.q2 = input;

      // Exemple API call pour personnaliser le message
      const response = await fetch("https://api.example.com/ussd-message?q2=" + encodeURIComponent(input));
      const data = await response.json();
      const message = data?.message || "Merci pour votre participation";

      return {
        text: message,
        nextStep: null,
        end: true
      };
    }
  },

  INFO: {
    handler: async () => ({
      text: "Service Airtel Quiz.\nMerci.",
      nextStep: null,
      end: true
    })
  }
};
