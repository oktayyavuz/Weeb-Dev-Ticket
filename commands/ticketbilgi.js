const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "ticket-bilgilendirme",
  description: "Ticket sisteminin nasıl kullanılacağını açıklar!",
  type: 1,
  options: [
    {
      name: 'kanal',
      type: 7, 
      description: 'Ticket oluşturma kanalı',
      required: true,
    },
    {
      name: 'rol',
      type: 8, 
      description: 'Destek ekibi rolü',
      required: true,
    }
  ],
  run: async (client, interaction) => {
    const member = interaction.member;
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "❌ | Yetkin Yok!", ephemeral: true });
    }
    
    const kanal = interaction.options.getChannel('kanal');
    const rol = interaction.options.getRole('rol');

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("**Ticket Sistemi Bilgilendirme**")
      .setDescription("Ticket sistemiyle nasıl iletişim kuracağınızı öğrenin.")
      .addFields(
        { name: "❗️❗️❗️Dikkat", value: `*▪ Ticketlarınızı açarken sebepsiz yere açmayınız.*\n*▪ Herhangi Bir Durumda İletişim:* <@&${rol.id}>` },
        { name: "Ticket Nasıl Açılır?", value: `1. <#${kanal.id}> kanalındaki ticket oluşturma butonuna tıklayın.\n2. Açılan kanalda talebinizi detaylı bir şekilde yazın.\n3. Yetkili ekibimiz en kısa sürede sizinle iletişime geçecektir.` },
        { name: "Ticket Kuralları", value: `*▪ Gereksiz yere ticket açmayınız.\n▪ Yetkililere saygılı olunuz.\n▪ Aynı konuda birden fazla ticket açmayınız.\n▪ Sorununuzu net bir şekilde ifade ediniz.\n▪ Ticket açtıktan sonra sabırlı olun, yetkililer size en kısa sürede yanıt verecektir.\n▪ Ticketlarınızda kişisel bilgilerinizi paylaşmamaya özen gösteriniz.\n▪ Ticketları kapatmadan önce yetkililerden onay alınız.*` }
      )
      .setImage('https://i.imgur.com/wOWRbbX.png')
      .setFooter({ text: "Dikkat: Ticketlarda yetkililere saygılı olalım." });

    await interaction.reply({ embeds: [embed] });
  }
};
