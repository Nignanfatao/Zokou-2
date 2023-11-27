const { zokou } = require("../framework/zokou");
const yts = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs');
const yt = require("../framework/dl/ytdl-core.js");
const ffmpeg = require("fluent-ffmpeg");
const yts1 = require("youtube-yts");

zokou({
  nomCom: "song",
  categorie: "Recherche",
  reaction: "💿"
}, async (origineMessage, zk, commandeOptions) => {
  const { ms, repondre, arg, auteurMessage } = commandeOptions;

  if (!arg[0]) {
    repondre("Veuillez entrer un terme de recherche s'il vous plaît.");
    return;
  }

  try {
    let topo = arg.join(" ");
    const search = await yts(topo);
    const videos = search.videos;

    if (videos && videos.length > 0 && videos[0]) {
      const urlElement = videos[0].url;

      let infoMess = {
        image: { url: videos[0].thumbnail },
        caption: `\n*nom de l'audio :* _${videos[0].title}_

*Durée :* _${videos[0].timestamp}_

*Lien :* _${videos[0].url}_

 Veillez entrez:

*1* : pour  avoir le song en audio
*2* : pour avoir le song en fichier doc
\n\n`
      };

      zk.sendMessage(origineMessage, infoMess, { quoted: ms });

       let choix = await zk.awaitForMessage({
          sender: auteurMessage,
          chatJid: origineMessage,
          timeout: 30000, // 30 secondes
        });
       repondre("Telechargement de l'audio en cours");
      const audioStream = ytdl(urlElement, { filter: 'audioonly', quality: 'highestaudio' });
      const filename = 'audio.mp3';
      const fileStream = fs.createWriteStream(filename);

      audioStream.pipe(fileStream);

      fileStream.on('finish', async () => {
    let indice ;   
     try { indice = choix.message.extendedTextMessage.text } catch { indice = choix.message.conversation }
       

        if ( indice  == 1) {
          zk.sendMessage(origineMessage, { audio: { url: "audio.mp3" }, mimetype: 'audio/mp4' }, { quoted: ms, ptt: false });
          console.log("Envoi du fichier audio terminé !");
        } else if (indice == 2) {
          let buttonMessage = {
            document: fs.readFileSync(`./audio.mp3`),
            mimetype: 'audio/mpeg',
            fileName: videos[0].title + ".mp3",
            headerType: 4,
            contextInfo: {
              externalAdReply: {
                title: videos[0].title,
                body: `by zokou-MD for you`,
                renderLargerThumbnail: true,
                thumbnailUrl: videos[0].thumbnail,
                mediaUrl: videos[0].url,
                mediaType: 1,
              },
            },
          };
          zk.sendMessage(origineMessage, buttonMessage, { quoted: ms });
        }
      });

      fileStream.on('error', (error) => {
        console.error('Erreur lors de l\'écriture du fichier audio :', error);
        repondre('Une erreur est survenue lors de l\'écriture du fichier audio.');
      });
    } else {
      repondre('Aucune vidéo trouvée.');
    }
  } catch (error) {
     if (error.name == 'Timeout' ) {
       return ;
     } else {
    console.error('Erreur lors de la recherche ou du téléchargement de la vidéo :', error);
    repondre('Une erreur est survenue lors de la recherche ou du téléchargement de la vidéo.');
     }
  }
});

zokou({
  nomCom: "video",
  categorie: "Recherche",
  reaction: "🎥"
}, async (origineMessage, zk, commandeOptions) => {
  const { arg, ms, repondre, auteurMessage } = commandeOptions;

  if (!arg[0]) {
    repondre("Veuillez entrer un terme de recherche s'il vous plaît.");
    return;
  }

  const topo = arg.join(" ");
  try {
    const search = await yts(topo);
    const videos = search.videos;

    if (videos && videos.length > 0 && videos[0]) {
      const Element = videos[0];

      let InfoMess = {
        image: { url: videos[0].thumbnail },
        caption: `*Nom de la vidéo :* _${Element.title}_
*Durée :* _${Element.timestamp}_
*Lien :* _${Element.url}_
_*En cours de téléchargement...*_\n\n Veillez entrez:

*1* : pour télécharger la vidéo en 
*2* : pour télécharger la vidéo en fichier doc
\n\n`
      };

      zk.sendMessage(origineMessage, InfoMess, { quoted: ms });

      let choix = await zk.awaitForMessage({
        sender: auteurMessage,
        chatJid: origineMessage,
        timeout: 30000, // 30 secondes
      });

      repondre("Téléchargement de la vidéo en cours");

      const videoInfo = await ytdl.getInfo(Element.url);
      const format = ytdl.chooseFormat(videoInfo.formats, { quality: '18' });
      const videoStream = ytdl.downloadFromInfo(videoInfo, { format });

      const filename = 'video.mp4';
      const fileStream = fs.createWriteStream(filename);

      videoStream.pipe(fileStream);

      fileStream.on('finish', async () => {
        let indice;
        try { indice = choix.message.extendedTextMessage.text } catch { indice = choix.message.conversation }

        if (indice == 1) {
          zk.sendMessage(origineMessage, { video: { url: "./video.mp4" }, caption: "*Zokou-MD", gifPlayback: false }, { quoted: ms });
          console.log("Envoi du fichier vidéo terminé !");
        } else if (indice == 2) {
          let buttonMessage = {
            document: fs.readFileSync(`./video.mp4`),
            mimetype: 'video/mp4',
            fileName: Element.title + ".mp4",
            headerType: 4,
            contextInfo: {
              externalAdReply: {
                title: Element.title,
                body: `by zokou-MD for you`,
                renderLargerThumbnail: true,
                thumbnailUrl: Element.thumbnail,
                mediaUrl: Element.url,
                mediaType: 2,
              },
            },
          };
          zk.sendMessage(origineMessage, buttonMessage, { quoted: ms });
        }
      });

      fileStream.on('error', (error) => {
        console.error('Erreur lors de l\'écriture du fichier vidéo :', error);
        repondre('Une erreur est survenue lors de l\'écriture du fichier vidéo.');
      });
    } else {
      repondre('Aucune vidéo trouvée.');
    }
  } catch (error) {
    if (error.name == 'Timeout') {
      return;
    } else {
      console.error('Erreur lors de la recherche ou du téléchargement de la vidéo :', error);
      repondre('Une erreur est survenue lors de la recherche ou du téléchargement de la vidéo.');
    }
  }
});
