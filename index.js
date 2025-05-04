const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } = require('discord.js')
const { botdurum, basvuru, token } = require('./ayarlar')
const db = require('croxydb')
const client = new Client({
     intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildExpressions,
          GatewayIntentBits.GuildIntegrations,
          GatewayIntentBits.GuildInvites,
          GatewayIntentBits.GuildMessagePolls,
          GatewayIntentBits.GuildMessageReactions,
          GatewayIntentBits.GuildMessageTyping,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildModeration,
          GatewayIntentBits.GuildPresences,
          GatewayIntentBits.GuildScheduledEvents,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.GuildWebhooks,
          GatewayIntentBits.AutoModerationConfiguration,
          GatewayIntentBits.AutoModerationExecution,
          GatewayIntentBits.DirectMessagePolls,
          GatewayIntentBits.DirectMessageReactions,
          GatewayIntentBits.DirectMessageTyping,
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.MessageContent
     ],
     partials: [
          Partials.Channel,
          Partials.GuildMember,
          Partials.GuildScheduledEvent,
          Partials.Message,
          Partials.Reaction,
          Partials.SoundboardSound,
          Partials.ThreadMember,
          Partials.User
     ]
})


client.on('ready', async () => {
     client.user.setActivity(`${botdurum || "Code World"}`)
     client.user.setStatus("idle")
     console.log(`${client.user.username} adıyla giriş yaptım.`)
     let basvuru_kanal = client.channels.cache.get(basvuru.basvuru_kanal)
     if (basvuru_kanal) {
          const row = new ActionRowBuilder()
               .addComponents(
                    new ButtonBuilder()
                         .setCustomId("basvuru-yap")
                         .setLabel("Başvuru Yap")
                         .setStyle(ButtonStyle.Secondary)
               )
          if (basvuru.basvuru_emoji) {
               row.components[0].setEmoji(basvuru.basvuru_emoji)
          }
          await basvuru_kanal.send({
               embeds: [{
                    author: { name: `${basvuru_kanal.guild.name}`, iconURL: basvuru_kanal.guild.iconURL() },
                    title: `Başvuru Sistemi`,
                    description: `Basvuru yapmak için aşağıdaki butona basabilirsiniz.`,
                    timestamp: new Date().toISOString(),
                    color: 0x5865f2,
                    footer: { text: `Başvuru Sistemi`, iconURL: client.user.avatarURL() },
                    thumbnail: {
                         url: basvuru_kanal.guild.iconURL()
                    }
               }],
               components: [row]
          })
     }
})

client.login(token)

client.on('interactionCreate', async (i) => {

     if (i.customId.startsWith('basvuru-yap')) {
          const modal = new ModalBuilder()
               .setCustomId('application')
               .setTitle('Başvuru Yap');

          const input1 = new TextInputBuilder()
               .setCustomId('isimyaş')
               .setLabel('İsiminiz ve Yaşınız.')
               .setMinLength(3)
               .setMaxLength(20)
               .setPlaceholder('İsminizi ve yaşınızı giriniz.')
               .setStyle(TextInputStyle.Short)
               .setRequired(true);

          const input2 = new TextInputBuilder()
               .setCustomId('nedenbiz')
               .setLabel('Neden Biz?')
               .setMinLength(3)
               .setMaxLength(200)
               .setPlaceholder('Neden bizimle çalışmak istediğinizi açıklayınız.')
               .setStyle(TextInputStyle.Short)
               .setRequired(true);
          const row = new ActionRowBuilder().addComponents(input1);
          const row2 = new ActionRowBuilder().addComponents(input2);
          modal.addComponents(row, row2);
          await i.showModal(modal);
     }

     if (i.isModalSubmit()) {
          if (i.customId === "application") {
               let isimyaş = i.fields.getTextInputValue('isimyaş')
               let nedenbiz = i.fields.getTextInputValue('nedenbiz')
               let log = client.channels.cache.get(basvuru.basvuru_log)
               if (log) {
                    const row = new ActionRowBuilder()
                         .addComponents(
                              new ButtonBuilder()
                                   .setCustomId("onayla")
                                   .setLabel("Onayla")
                                   .setStyle(ButtonStyle.Success),
                              new ButtonBuilder()
                                   .setCustomId("reddet")
                                   .setLabel("Reddet")
                                   .setStyle(ButtonStyle.Danger)
                         )
                    if (basvuru.basvuru_onay_emoji) {
                         await row.components[0].setEmoji(basvuru.basvuru_onay_emoji)
                    }
                    if (basvuru.basvuru_red_emoji) {
                         await row.components[1].setEmoji(basvuru.basvuru_red_emoji)
                    }
                    await log.send({
                         embeds: [{
                              author: { name: `${i.guild.name}`, iconURL: i.guild.iconURL() },
                              title: `Başvuru Sistemi`,
                              description: `Aşağıda **${i.user.username}** adlı kişinin başvurusu bulunuyor.`,
                              fields: [
                                   { name: `Kullanıcı`, value: `${i.user} - **${i.user.username}** - \`${i.user.id}\`` },
                                   { name: `İsiminiz Yaşınız?`, value: `${isimyaş}` },
                                   { name: `Neden Biz?`, value: `${nedenbiz}` }
                              ],
                              color: 0x5865f2,
                              timestamp: new Date().toISOString(),
                              footer: { text: `Başvuru Sistemi`, iconURL: client.user.avatarURL() },
                              thumbnail: {
                                   url: i.guild.iconURL()
                              }
                         }],
                         components: [row]
                    }).then(async (e) => {
                         db.set(`basvuru_${i.guild.id}_${e.id}`, i.user.id)
                    })
                    await i.reply({ content: `Başvurunuz gönderildi!`, ephemeral: true })
               } else {
                    await i.reply({ content: `Log kanalı ayarlı olmadığından işlem başarısız oldu.`, ephemeral: true })
               }
          }
     }

     if (i.customId.startsWith('onayla')) {
          if (i.member.permissions.has(PermissionsBitField.Flags.Administrator) || i.member.roles.cache.get(basvuru.basvuru_yetkili_rol)) {
               try {
                    let data = db.get(`basvuru_${i.guild.id}_${i.message.id}`)
                    let user = i.guild.members.cache.get(data)
                    await user.roles.add(basvuru.onay_rol)
                    await user.send(`**${i.guild.name}** adlı sunucuda yaptığın yetkili başvurusu onaylandı.`).catch(() => { })
                    await i.update({ components: [] })
                    await i.followUp({ content: `${user.user.username} adlı şahısın başvusuru onaylandı.`, ephemeral: true })
               } catch (err) {
                    console.log(err)
               }
          } else {
               await i.reply({ content: `Bu butonu kullanmak için yeterli yetkin yok.`, ephemeral: true })
          }
     }
     if (i.customId.startsWith('reddet')) {
          if (i.member.permissions.has(PermissionsBitField.Flags.Administrator) || i.member.roles.cache.get(basvuru.basvuru_yetkili_rol)) {
               try {
                    let data = db.get(`basvuru_${i.guild.id}_${i.message.id}`)
                    let user = i.guild.members.cache.get(data)
                    await user.send(`**${i.guild.name}** adlı sunucuda yaptığın yetkili başvurusu reddedildi.`).catch(() => { })
                    await i.update({ components: [] })
                    await i.followUp({ content: `${user.user.username} adlı şahısın başvusurunu reddettin.`, ephemeral: true })
               } catch (err) {
                    console.log(err)
               }
          } else {
               await i.reply({ content: `Bu butonu kullanmak için yeterli yetkin yok.`, ephemeral: true })
          }
     }
})
