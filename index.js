require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const { getVoiceConnection } = require('@discordjs/voice');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });

const prefix = '.';

function log(message) {
    console.log(message);
    fs.appendFileSync('music_bot_log.txt', message + '\n');
}

// Sample song list (you should replace these with actual song files)
const songs = [
    { file: 'song1.mp3', title: 'Song 1', artist: 'Artist 1', album: 'Album 1', year: '2020' },
    { file: 'song2.mp3', title: 'Song 2', artist: 'Artist 2', album: 'Album 2', year: '2019' },
    { file: 'song3.mp3', title: 'Song 3', artist: 'Artist 3', album: 'Album 3', year: '2021' },
];

let currentSong = null;
let quizActive = false;
let scores = {};
let roundNumber = 0;
const maxRounds = 5;

client.once('ready', () => {
    log('Advanced Music Quiz Bot is online!');
    client.user.setActivity('Music Quiz | .help', { type: 'PLAYING' });
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    switch(command) {
        case 'start':
            log('Start command received');
            startQuiz(message);
            break;
        case 'guess':
            log('Guess command received');
            handleGuess(message, args.join(' '));
            break;
        case 'help':
            sendHelpEmbed(message.channel);
            break;
        case 'leaderboard':
            showLeaderboard(message.channel);
            break;
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'skip') {
        skipSong(interaction);
    }
});

async function startQuiz(message) {
    if (!message.member.voice.channel) {
        return message.channel.send('You need to be in a voice channel to start the quiz!');
    }

    if (quizActive) {
        return message.channel.send('A quiz is already in progress!');
    }

    quizActive = true;
    scores = {};
    roundNumber = 0;

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Music Quiz Starting!')
        .setDescription('Get ready to guess the song title or artist!')
        .addFields(
            { name: 'How to play', value: 'Use .guess [song title or artist] to make a guess' },
            { name: 'Rounds', value: `${maxRounds}` },
            { name: 'Good luck!', value: 'May the best music fan win!' }
        );

    message.channel.send({ embeds: [embed] });

    const connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
    });

    playSong(connection, message.channel);
}

function playSong(connection, textChannel) {
    roundNumber++;
    if (roundNumber > maxRounds || songs.length === 0) {
        endQuiz(textChannel);
        connection.destroy();
        return;
    }

    currentSong = songs[Math.floor(Math.random() * songs.length)];
    const audioPlayer = createAudioPlayer();
    const resource = createAudioResource(path.join(__dirname, 'songs', currentSong.file));

    connection.subscribe(audioPlayer);
    audioPlayer.play(resource);

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Round ${roundNumber} of ${maxRounds}`)
        .setDescription('New song playing! You have 30 seconds to guess.')
        .setFooter({ text: 'Use .guess [song title or artist] to make a guess' });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('skip')
                .setLabel('Skip Song')
                .setStyle(ButtonStyle.Primary),
        );

    textChannel.send({ embeds: [embed], components: [row] });

    audioPlayer.on(AudioPlayerStatus.Idle, () => {
        const timeUpEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Time\'s up!')
            .setDescription(`The song was "${currentSong.title}" by ${currentSong.artist}`)
            .addFields(
                { name: 'Album', value: currentSong.album },
                { name: 'Year', value: currentSong.year }
            );
        textChannel.send({ embeds: [timeUpEmbed] });
        setTimeout(() => playSong(connection, textChannel), 5000);
    });

    // Stop playing after 30 seconds
    setTimeout(() => audioPlayer.stop(), 30000);
}

function handleGuess(message, guess) {
    if (!quizActive || !currentSong) return;

    const normalizedGuess = guess.toLowerCase();
    const normalizedTitle = currentSong.title.toLowerCase();
    const normalizedArtist = currentSong.artist.toLowerCase();

    if (normalizedGuess === normalizedTitle || normalizedGuess === normalizedArtist) {
        scores[message.author.id] = (scores[message.author.id] || 0) + 1;
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Correct Answer!')
            .setDescription(`${message.author} guessed it! The song is "${currentSong.title}" by ${currentSong.artist}`)
            .addFields(
                { name: 'Album', value: currentSong.album },
                { name: 'Year', value: currentSong.year },
                { name: 'Your Score', value: `${scores[message.author.id]}` }
            );
        message.channel.send({ embeds: [embed] });
        currentSong = null;
    } else {
        message.channel.send('Sorry, that\'s not correct. Keep guessing!');
    }
}

function endQuiz(textChannel) {
    quizActive = false;
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const winner = sortedScores[0];
    
    const embed = new EmbedBuilder()
        .setColor('#ffd700')
        .setTitle('Music Quiz Ended!')
        .setDescription('Final Scores:')
        .addFields(
            { name: 'Winner', value: winner ? `<@${winner[0]}> with ${winner[1]} points!` : 'No winners this time.' }
        );
    
    sortedScores.forEach(([userId, score], index) => {
        embed.addFields({ name: `#${index + 1}`, value: `<@${userId}>: ${score} points` });
    });
    
    textChannel.send({ embeds: [embed] });
}

function skipSong(interaction) {
    if (!quizActive) {
        return interaction.reply("There is no active quiz to skip songs in!");
    }

    const connection = getVoiceConnection(interaction.guild.id);
    if (connection) {
        const player = connection.state.subscription?.player;
        if (player) {
            player.stop();
            interaction.reply("Skipping current song...");
        } else {
            interaction.reply("No song is currently playing.");
        }
    } else {
        interaction.reply("The bot is not connected to a voice channel.");
    }

}
function sendHelpEmbed(channel) {
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Music Quiz Bot Help')
        .setDescription('Here are the available commands:')
        .addFields(
            { name: `${prefix}start`, value: 'Start a new music quiz' },
            { name: `${prefix}guess [song title or artist]`, value: 'Make a guess during an active quiz' },
            { name: `${prefix}leaderboard`, value: 'Show the current leaderboard' },
            { name: `${prefix}help`, value: 'Show this help message' }
        );
    channel.send({ embeds: [embed] });
}

function showLeaderboard(channel) {
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Music Quiz Leaderboard')
        .setDescription('Current standings:');
    
    sortedScores.forEach(([userId, score], index) => {
        embed.addFields({ name: `#${index + 1}`, value: `<@${userId}>: ${score} points` });
    });

    channel.send({ embeds: [embed] });
}

client.login(process.env.BOT_TOKEN).then(() => {
    log('Login successful!');
}).catch(error => {
    log('Login failed: ' + error);
});


