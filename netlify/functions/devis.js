// Netlify Function pour traiter les demandes de devis
exports.handler = async (event, context) => {
  console.log('🚀 Fonction Netlify déclenchée');
  console.log('Method:', event.httpMethod);
  console.log('Body:', event.body);

  // Configuration CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Répondre aux requêtes OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Traiter seulement les requêtes POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Méthode non autorisée'
      })
    };
  }

  try {
    // Parser les données du formulaire
    const data = JSON.parse(event.body);
    console.log('📝 Données reçues:', data);

    const {
      nom,
      email,
      telephone,
      typeService,
      datePrevisionnelle,
      adresseDepart,
      adresseArrivee,
      message
    } = data;

    // Validation des champs requis
    if (!nom || !email || !telephone || !typeService || !adresseDepart || !adresseArrivee || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Tous les champs obligatoires doivent être remplis'
        })
      };
    }

    // Fonction pour formater les types de service
    const formatTypeService = (type) => {
      const types = {
        'demenagement-residentiel': 'Déménagement résidentiel',
        'demenagement-entreprise': 'Déménagement d\'entreprise',
        'demenagement-international': 'Déménagement international',
        'garde-meuble': 'Garde-meuble',
        'transport-piano': 'Transport de piano',
        'emballage': 'Service d\'emballage'
      };
      return types[type] || type;
    };

    // Fonction pour formater la date
    const formatDate = (dateStr) => {
      if (!dateStr) return 'Non spécifiée';
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Template pour l'email que le CLIENT envoie à REFLEX DÉMÉNAGEMENT
    const emailBody = `Bonjour,

Je vous contacte pour une demande de devis de déménagement.

RÉCAPITULATIF DE MA DEMANDE :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 MES COORDONNÉES :
• Nom : ${nom}
• Email : ${email}
• Téléphone : ${telephone}

🏠 DÉTAILS DU DÉMÉNAGEMENT :
• Service demandé : ${formatTypeService(typeService)}
• Date prévisionnelle : ${formatDate(datePrevisionnelle)}
• Adresse de départ : ${adresseDepart}
• Adresse d'arrivée : ${adresseArrivee}

💬 MON MESSAGE :
"${message}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 INFORMATIONS COMPLÉMENTAIRES :
• Je souhaite recevoir un devis personnalisé
• Je suis disponible pour un rendez-vous ou un appel
• Merci de me recontacter dans les plus brefs délais

Cordialement,
${nom}

---
📧 ${email}
📞 ${telephone}

Demande envoyée le ${new Date().toLocaleString('fr-FR')}`;

    // Sujet de l'email
    const emailSubject = `Demande de devis - ${formatTypeService(typeService)} - ${nom}`;

    // Génération des liens Gmail
    const destinataireEmail = 'reflexdemenagement@gmail.com';
    const mailtoLink = `mailto:${destinataireEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const gmailWebLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(destinataireEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    console.log(`✅ Demande de devis reçue de ${nom} (${email})`);
    console.log(`📧 Liens Gmail générés pour envoyer vers ${destinataireEmail}`);

    // Réponse de succès
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Demande de devis reçue avec succès',
        data: {
          client: {
            nom,
            email,
            telephone
          },
          service: formatTypeService(typeService),
          destinataire: destinataireEmail,
          mailtoLink: mailtoLink,
          gmailWebLink: gmailWebLink,
          dateDevis: new Date().toISOString(),
          summary: `Demande de ${formatTypeService(typeService)} de ${nom}`
        }
      })
    };

  } catch (error) {
    console.error('❌ Erreur lors du traitement:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Erreur interne du serveur',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
