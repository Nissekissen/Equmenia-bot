![Equmenia Logo](https://equmenia.se/wp-content/uploads/sites/3/2021/04/logo-med-bakgrund-scaled.jpg)
# Equmenia-bot



The official bot for Equmenia Gaming's Discord server.

  

## Requirements

  

* Node.js v 17.0.0 or newer

* Git installed on your computer

  

## Installing

  

To install the packages, run the following commands:

  

```

git clone https://github.com/Nissekissen/Equmenia-bot.git

cd Equmenia-bot

npm install

```

  

After the installation finished follow configuration instructions. The run `npm run dev` to start the bot.

  

## Configuration

  

Copy or Rename `config_.json` to config.json and fillout the values:

  

⚠️ **Note: Never commit or share your token or api keys publicly** ⚠️

  

```json
{
	"clientId": "BOT_ID",
	"guildId": "SERVER_ID",
	"token": "BOT_TOKEN"
}
```


## Built With

  

* [Discord.js](https://discord.js.org/#/) - The Discord API Library used

* [Node-cron](https://github.com/kelektiv/node-cron) - Library for event scheduling

* [Axios](https://github.com/axios/axios) - HTTP Client
  

## Authors

  

*  **REEEEEEEboi** - *All current work* - [Nissekissen](https://github.com/Nissekissen)

  

See also the list of [contributors](https://github.com/Nissekissen/Equmenia-bot/contributors) who participated in this project.

  

## License

  

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

  

## Features

  

Here is a list of the current features and commands:

  

#### /roller

>  ##### /roller skapa `<name of message> <channel> <content>`

>> Creates and sends a message in the given channel.

>>

>  ##### /roller lägg_till `<name of message> <emoji> <Title> <role to give>`

>> Adds a button to the given message.

>>

>  ##### /roller ta_bort `<name of message> <role>`

>> Removes the button connected to the given role

  

#### /bibelord

> Sends today's bibelord in the channel.

  

#### /setchannel `<channel>`

> Set the channel for  incoming forms to pop up. This channel should only be visible to moderators.

#### /sendmessage `<channel>` `<title>` `<content>`
> Sends a message in the specified channel with a button to start the form.
---
> :memo: **Note:** <> means Required argument and [] means Optional argument