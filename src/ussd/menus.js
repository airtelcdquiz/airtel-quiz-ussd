module.exports = {
  HOME: {
    text: "1. Airtel Quiz\n2. Infos",
    next: {
      "1": "QUIZ_Q1",
      "2": "INFO"
    }
  },

  QUIZ_Q1: {
    text: "Question 1:\n1. Oui\n2. Non",
    saveAs: "q1",
    next: {
      "1": "QUIZ_Q2",
      "2": "QUIZ_Q2"
    }
  },

  QUIZ_Q2: {
    text: "Question 2:\n1. A\n2. B",
    saveAs: "q2",
    next: {
      // après la saisie, on passe automatiquement à l'écran final
      default: "FINAL"
    }
  },

  INFO: {
    text: "Service Airtel Quiz.\nMerci.",
    end: true
  },

  FINAL: {
    text: "Merci pour votre participation !",
    end: true
  }
};
