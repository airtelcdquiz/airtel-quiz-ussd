const submitService = require("../services/submitService");
const { logJson, logError } = require("../utils/logger");

const menu_home = require("./pages/home");
const menu_register = require("./pages/register");

const menus = {
  HOME: menu_home.STARTING_POINT,
  START_REGISTER: menu_register.START_REGISTER,
  ASK_AGE: menu_register.ASK_AGE,
  // Ajouter d'autres menus ici
};

async function handleUssdInput(session, userInput, msisdn) {
  let step = null ;
  let userInputTrimmed = userInput ? userInput.trim() : null;
  // Injecter MSISDN dès le début
  session.msisdn = session.msisdn || msisdn;

  // Compteur de séquence
  session.sequence = (session.sequence || 0) + 1;

  if(session.step && session.stepSaveAs && userInputTrimmed ){
    // Sauvegarder l'input de l'utilisateur dans session.data si saveAs est défini
    session.data = session.data || {};
    session.data[session.stepSaveAs] = userInputTrimmed;
  }

  if(session.nextSteps && userInputTrimmed) {
    if(session.nextSteps[userInputTrimmed]){
      step = session.nextSteps[userInputTrimmed];
      console.log(">>>>>>>> LE USER A CHOISI: ", userInputTrimmed, "=> STEP SUIVANT: ", step);
    }else if(session.nextStep){
      step = session.nextStep;
      console.log(">>>>>>>> STEP SUIVANT PAR DEFAUT: ", step);
    }
    userInputTrimmed = null; // Clear userInput after using
  }else{
    console.log(">>>>>>>> PAS DE STEP SUIVANT DEFINI: ", session.nextSteps, session.nextStep, "=> RESTE SUR LE MEME MENU");
  }

  // Récupérer le menu courant
  let currentMenu = menus[step] || menus.HOME;
  let result;

  console.log(">>>>>>>> MENU COURANT: ", currentMenu);
  
  try {
    if (currentMenu.handler) { 
      result = await currentMenu.handler(session, userInputTrimmed); 
    }else{
      result = currentMenu;
    }

    // 3️⃣ Menu simple statique sans handler ni nextSteps
    if (!result) {
      result = {
        text: currentMenu.text || "Menu indisponible",
        end: !!currentMenu.end
      };
    }

  } catch (err) {
    logError(err, { stage: "menuHandler", step: session.step, sessionId: session.id });
    return {
      text: "Erreur, veuillez réessayer",
      end: true,
      sequence: session.sequence
    };
  }

  // 4️⃣ Log JSON pour Kibana/Grafana
  logJson({
    event: "ROUTER_STEP",
    step: session.step,
    userInput,
    sequence: session.sequence,
    sessionData: session.data
  });

  // 5️⃣ Fin de parcours : soumettre les données
  if (result.end) {
    try {
      submitService.submit(session.data || {});
      logJson({ event: "SUBMIT_DATA", sessionId: session.id, data: session.data });
    } catch (err) {
      logError(err, { stage: "submitService", sessionId: session.id, sequence: session.sequence });
    }

    return {
      text: result.text,
      end: true,
      sequence: session.sequence
    };
  }

  session.nextSteps = result.nextSteps; // pour le menu suivant
  session.nextStep = session.nextStep // default;
  session.step = step || session.step; // Mettre à jour le step pour les logs
  session.stepSaveAs = currentMenu.saveAs; // pour les logs

  // 6️⃣ Retour menu courant ou suivant
  return {
    text: result.text,
    end: false,
    sequence: session.sequence
  };
}

module.exports = handleUssdInput;
