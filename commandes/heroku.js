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



	   cmd(
  {
    pattern: "updatenow",
    desc: "update bot with main repo.",
    filename: __filename,
    category: "misc",
  },
  async (Void,citel,text,{isCreator}) => {
    async function updatedb() {	
      const simpleGit = require('simple-git')	
          const git = simpleGit();	
        const Heroku = require('heroku-client');	
        const heroku = new Heroku({ token: process.env.HEROKU_API_KEY })	
          await git.fetch();	
              var commits = await git.log(['main' + '..origin/' +'main']);	
              if (commits.total === 0) {	
                return 'ʏᴏᴜ..ʜᴀᴠᴇ...ᴀʟʀᴇᴅʏ..ᴜᴘᴅᴀᴛᴇᴅ...'	
              } else {	
                    var app = await heroku.get('/apps/' + process.env.HEROKU_APP_NAME)	
                   //   await Void.sendMessage(citel.chat,{text:'*ᴜᴘᴅᴀᴛɪɴɢ...*'})	
                  git.fetch('upstream', 'main');	
                  git.reset('hard', ['FETCH_HEAD']);	
      
                  var git_url = app.git_url.replace(	
                    "https://", "https://api:" + process.env.HEROKU_API_KEY + "@"	
                  )   	
                  try {	
                    await git.addRemote('heroku', git_url);	
                  } catch { console.log('heroku remote adding error'); }	
                  await git.push('heroku', 'main');	
      
                  return '*ʙᴏᴛ ᴜᴘᴅᴀᴛᴇᴅ...*\n_Restarting._'	
      
      
              }	
            }	
       if(!isCreator) return citel.reply(tlang().owner);
       if (Config.heroku=true){
        const DB = require('../lib')
        let commits = await DB.syncgit()
        if (commits.total === 0)  {
         citel.reply(`Hey ${citel.pushName}. You have latest version installed.`)
          } else { 
             citel.reply('Build Started...')
            let update = await DB.updatedb()
              citel.reply(update)
          }

       }
       let check = await get_deployments()
       if(check==='true') return citel.reply('_Please wait..._\n_Currently 2 instances are running in Koyeb,wait to stop one of them._')
       let data = await redeploy();
       return citel.reply(data)
  }) 
