const { zokou } = require('../framework/zokou');
const s = require('../set')


zokou(
    {
        nomCom : "setvar",
        categorie : "heroku"
    }, async (dest , zk , commandeOptions) =>{

       const {ms,repondre,superUser , arg} = commandeOptions ;
       
       if(!superUser){repondre('Commande reserver au proprietaire du bot');return};
       if(!arg[0] || !(arg.join('').split('='))) {repondre('Mauvais formats ; voici le mode d\'emploie.\nSetvar NOM_OWNER=Fredora');return};
     
    const text = arg.join(" ")
     const Heroku = require("heroku-client");
   
     const heroku = new Heroku({
        token: s.HEROKU_APY_KEY,
      });

     let baseURI = "/apps/" + s.HEROKU_APP_NAME;
        await heroku.patch(baseURI + "/config-vars", {
          body: {
                  [text.split('=')[0]]: text.split('=')[1],
          },
        });
        await repondre('variable actualiser , redemarrage en cours....')
    }
);

zokou(
    {
        nomCom : "getallvar",
        categorie : "heroku"
    }, async (dest , zk , commandeOptions) =>{

       const {ms,repondre,superUser , arg} = commandeOptions ;
       
       if(!superUser){repondre('Commande reserver au proprietaire du bot');return}; 
      
            const Heroku = require("heroku-client");

			const heroku = new Heroku({
				token: s.HEROKU_APY_KEY,
			});
			let baseURI = "/apps/" + s.HEROKU_APP_NAME;

            let h = await heroku.get(baseURI+'/config-vars')
let str = '*liste des variables  Heroku *\n\n'
for (vr in h) {
str+= '🍁 *'+vr+'* '+'= '+h[vr]+'\n'
}
 repondre(str)


}

);       


    zokou(
        {
            nomCom : "getvar",
            categorie : "heroku"
        }, async (dest , zk , commandeOptions) =>{
    
           const {ms,repondre,superUser , arg} = commandeOptions ;
           
           if(!superUser){repondre('Commande reserver au proprietaire du bot');return}; 
           if(!arg[0]) {repondre('Inserez le nom de la variabke en grand Charactere'); return} ;
      
           try {
            const Heroku = require("heroku-client");
               
            const heroku = new Heroku({
              token: s.HEROKU_APY_KEY,
            });
            let baseURI = "/apps/" + s.HEROKU_APP_NAME;
        let h = await heroku.get(baseURI+'/config-vars')
        for (vr in h) {
        if( arg.join(' ') ===vr ) return  repondre( vr+'= '+h[vr]) 	;
        } 
        
        } catch(e) {repondre('Erreur lors de la procedure ' + e)}
   
        });

// Fonction pour récupérer les déploiements en cours
async function d(hk) {
    try {
        const formations = await hk.get(`/apps/${process.env.HEROKU_APP_NAME}/formation`);
        return formations.length > 1;
    } catch (error) {
        console.error('Erreur lors de la récupération des déploiements :', error);
        return false;
    }
}

// Fonction pour vérifier si le fork est déjà à jour
async function f() {
    const simpleGit = require('simple-git');
    const git = simpleGit();

    try {
        await git.fetch();
        const status = await git.status();
        return status.behind === 0;
    } catch (error) {
        console.error('Erreur lors de la vérification de la mise à jour du fork :', error);
        return false;
    }
}

zokou(
    {
        nomCom: "maj",
        categorie: "heroku"
    }, async (dest, zk, commandeOptions) => {

        const { ms, repondre, superUser, arg } = commandeOptions;

        if (!superUser) {
            repondre('Commande réservée au propriétaire du bot');
            return;
        }

        const Heroku = require('heroku-client');
        const hk = new Heroku({ token: process.env.HEROKU_API_KEY });
        const baseURI = "/apps/" + process.env.HEROKU_APP_NAME;
        
        // Vérifier si des déploiements sont déjà en cours
        const dp = await d(hk);
        if (dp) {
            return repondre('_Veuillez patienter..._\n_Il y a actuellement des déploiements en cours._');
        }

        // Vérifier si le fork est déjà à jour
        const fork = await f();
        if (fork) {
            return repondre('Votre fork est déjà à jour.');
        }

        // Mettre à jour le fork
        const simpleGit = require('simple-git');
        const git = simpleGit();
        try {
            await git.pull('origin', 'main');
        } catch (error) {
            console.error('Erreur lors de la mise à jour du fork :', error);
            return repondre('Erreur lors de la mise à jour du fork.');
        }

        // Déclencher un nouveau build pour redéployer l'application
        await hk.post(baseURI + "/builds", { body: {} });

        return repondre('Fork mis à jour avec succès.\n Mise à jour du code en cours..._');
    }
);
