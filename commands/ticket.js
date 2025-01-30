const { Client, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require("discord.js");
const db = require("croxydb");
const { createTranscript } = require('discord-html-transcripts');

module.exports = {
    name: "ticket-sistemi",
    description: "Ticket sistemi!",
    type: 1,
    options: [
        {
            name: "ticket-log",
            description: "Ticket loglarının düşeceği kanal!",
            type: 7,
            required: true,
        },
        {
            name: "ticket-kanal",
            description: "Ticket Metin kanalı!",
            type: 7,
            required: true,
        },
        {
            name: "ticket-kategori",
            description: "Ticketların oluşturulacağı kategori!",
            type: 7,
            required: true,
            channel_types: [4]
        },
        {
            name: "ticket-rol",
            description: "Ticketlarla ilgilenecek yetkili rol!",
            type: 8,
            required: true,
        }
    ],
    run: async (client, interaction) => {
        const member = interaction.member;
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ | Yetkin Yok!", ephemeral: true });
        }
        const ticketLogKanal = interaction.options.getChannel('ticket-log');
        const ticketKanal = interaction.options.getChannel('ticket-kanal');
        const ticketKategori = interaction.options.getChannel('ticket-kategori');
        const ticketYetkiliRol = interaction.options.getRole('ticket-rol');

        db.set(`ticketLogKanal_${interaction.guild.id}`, ticketLogKanal.id);
        db.set(`ticketKategori_${interaction.guild.id}`, ticketKategori.id);
        db.set(`ticketYetkiliRol_${interaction.guild.id}`, ticketYetkiliRol.id);

        const info = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("**Weeb Dev Ticket Sistemi**")
            .setDescription("Ticket Oluşturarak iletişime geçebilirsiniz.")
            .addFields(
                { name: "❗️❗️❗️Dikkat", value: `*▪ Ticketlarınızı açarken sebepsiz yere açmayınız.*\n*▪ Herhangi Bir Durumda İletişim:* <@&${ticketYetkiliRol.id}>` }
            )
            .setImage('https://i.imgur.com/wOWRbbX.png')
            .setFooter({ text: "Dikkat: Ticketlarda yetkililere saygılı olalım." });

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setEmoji('🎟')
                    .setLabel("Sunucu Destek")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId("ticket_olustur"),
                new ButtonBuilder()
                    .setEmoji('🎫')
                    .setLabel("Diğer")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("diger_ticket")
            );

        await ticketKanal.send({ embeds: [info], components: [buttons] });
        return interaction.reply({ content: 'Ticket sistemi başarıyla kuruldu.', ephemeral: true });
    }
};

client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
        const guild = interaction.guild;
        const member = interaction.member;
        const kanal = interaction.channel;
        const ticketYetkiliRol = db.get(`ticketYetkiliRol_${guild.id}`);

        if (!ticketYetkiliRol) {
            return interaction.reply({ content: 'Ticket kategorisi veya yetkili rolü ayarlanmamış.', ephemeral: true });
        }

        if (interaction.customId === 'ticket_olustur' || interaction.customId === 'diger_ticket') {
            const ticketKategori = db.get(`ticketKategori_${guild.id}`);
            if (!ticketKategori) {
                return interaction.reply({ content: 'Ticket kategorisi ayarlanmamış.', ephemeral: true });
            }

            const kanalAdi = `${interaction.customId === 'ticket_olustur' ? 'ticket' : 'diger'}-${member.user.username}`;
            const ticketChannel = await guild.channels.create({
                name: kanalAdi,
                type: 0, 
                parent: ticketKategori,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: member.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                    },
                    {
                        id: ticketYetkiliRol,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                    }
                ]
            });

            const embed = new EmbedBuilder()
                .setColor("Blue")
                .setTitle("Weeb Dev ")
                .setDescription("Merhaba, ekibimiz en kısa süre içerisinde ilgilenecektir.")
                .addFields(
                    { name: "Önemli!", value: "• Discord talepleri içerisinde herhangi bir şekilde özel bilgilerinizi iletmeyiniz. Örnek olarak Sunucu ip adresiniz, kullanıcı adınız, şifreniz vs.\n• Yetkililere kesinlikle etiket atmak YASAKTIR.\n• Kesinlikle DM üzerinden destek BULUNMAMAKTADIR." }
                )
                .setImage('https://i.imgur.com/wOWRbbX.png')
                .setFooter({ text: "Dikkat: Ticketlarda yetkililere saygılı olalım." });

            const etiketleme = `<@${member.id}> | <@&${ticketYetkiliRol}>`;

            const ticket = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Kapat")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId("ticket_close"),
                    new ButtonBuilder()
                        .setLabel("Bileti Nedeniyle Kapat")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId("ticket_reason_close")
                );

            await ticketChannel.send({ content: etiketleme, embeds: [embed], components: [ticket] });
            return interaction.reply({ content: 'Ticket kanalınız oluşturuldu. Lütfen gerekli bilgileri sağlayın.', ephemeral: true });
        } else if (interaction.customId === 'ticket_close') {
            const ticketLogKanalId = db.get(`ticketLogKanal_${interaction.guild.id}`);
            const ticketLogKanal = interaction.guild.channels.cache.get(ticketLogKanalId);
            const transcript = await createTranscript(kanal, { returnBuffer: false });

            await ticketLogKanal.send({ content: `Ticket kapandı: ${kanal.name}`, files: [transcript] });
            await kanal.delete();
        } else if (interaction.customId === 'ticket_reason_close') {
            const modal = new ModalBuilder()
                .setCustomId('ticketReasonModal')
                .setTitle('Ticket Kapatma Nedeni')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('ticketReasonInput')
                            .setLabel('Kapatma Nedeni')
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    )
                );

            await interaction.showModal(modal);
        }
    } else if (interaction.type === InteractionType.ModalSubmit) {
        if (interaction.customId === 'ticketReasonModal') {
            const reason = interaction.fields.getTextInputValue('ticketReasonInput');
            const kanal = interaction.channel;
            const ticketLogKanalId = db.get(`ticketLogKanal_${interaction.guild.id}`);
            const ticketLogKanal = interaction.guild.channels.cache.get(ticketLogKanalId);
            
            await interaction.deferUpdate();
            
            const transcript = await createTranscript(kanal, { returnBuffer: false });
            await ticketLogKanal.send({ content: `Ticket kapandı: ${kanal.name} (Nedeni: ${reason})`, files: [transcript] });
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await kanal.delete();
        }
    }
});