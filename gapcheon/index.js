import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";
import { Client, GatewayIntentBits, AttachmentBuilder } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import axios from "axios";

const clientId = process.env.CLIENT_ID; // 봇의 클라이언트 ID
const TOKEN = process.env.TOKEN;  // 봇의 토큰
const APIKEY = process.env.APIKEY; // 공공데이터포털 API 키

const CCTV_URL = 'https:cctvsec.ktict.co.kr/60785/LUO/+IP7hevhYuUiSRvlZiFLMog594/o6FkZtcuNjfRPh0PvG64AktxJ5oEXdca2';

const now = new Date();
const years = now.getFullYear()-2;

const fullUrl = `http://apis.data.go.kr/1741000/RegionalSafetyGrade/getRegionalSafetyGradeList?serviceKey=${APIKEY}&pageNo=1&numOfRows=10&type=json&bas_yy=${years}`


const gapcheon = new AttachmentBuilder('./images/jump.jpg');
const gapcheon2 = new AttachmentBuilder('./images/nojump.jpg');
// 슬래시 명령어 정의
const commands = [
  new SlashCommandBuilder().setName('현재시각').setDescription('현재 시간을 알려줍니다!'),
  new SlashCommandBuilder().setName('이모지').setDescription('테스트 이모지를 보냅니다'),
  new SlashCommandBuilder().setName('자살').setDescription('앗!? 자살이요? 자살 등급을 알려드릴께요'),
  new SlashCommandBuilder().setName('날씨').setDescription('오늘 날씨와 금강을 알아봐드릴께요'),
  new SlashCommandBuilder().setName('애교').setDescription('ㅇ...애교요..?'),
  new SlashCommandBuilder().setName('갑천근황').setDescription('갑천 유량과 cctv영상을 보내드릴께요'),
]
  .map(command => command.toJSON());

// 디스코드 API에 명령어 등록
const rest = new REST({ version: '9' }).setToken(TOKEN);

(async () => {
  try {
    console.log('슬래시 명령어 전역 등록 중...');

    await rest.put(
      Routes.applicationCommands(clientId), // 전역에 명령어 등록
      { body: commands } // 명령어 배열 전달
    );

    console.log('슬래시 명령어 전역 등록 완료!');
  } catch (error) {
    console.error('명령어 등록 중 에러 발생:', error);
  }
})();


const unji = async () => {
  try{
    const response = await axios.get(fullUrl);
    console.log(response.data.RegionalSafetyGrade[1].row[5]);
    const content = response.data.RegionalSafetyGrade[1].row[5];
    const content2 = `${content.bas_yy}년 ${content.regi} 기준으로 자살 등급은 ${content.suicid}급 이네요! 풍덩🌊🌊!!!`;
    return content2;

  } catch (error) {
    console.error('API 요청 중 에러 발생!!:', error);
    return error;
  }
}
// 날씨 API 요청 함수
const weather = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate() - 1).padStart(2, '0');
  const day2 = String(today.getDate() - 2).padStart(2, '0');
  const fullDate = `${year}${month}${day}`;
  const fullDate2 = `${year}${month}${day2}`;
  const endpoint = 'http://apis.data.go.kr/1360000/AsosDalyInfoService/getWthrDataList?'
  const url = `${endpoint}serviceKey=${APIKEY}&pageNo=1&numOfRows=10&dataCd=ASOS&dateCd=DAY&startDt=${fullDate2}&endDt=${fullDate}&stnIds=133&dataType=JSON`;

  try{
    const response = await axios.get(url);
    const weatherData = response.data.response.body.items.item[1];
    const area = weatherData.stnNm;
    const weatherDay = weatherData.tm;
    const steam = weatherData.avgRhm;
    const rain = weatherData.sumRn == '' ? '0' : weatherData.sumRn;
    const temp = weatherData.avgTa;
    const maxTemp = weatherData.maxTa;
    const unjiWeather = weatherData.sumRn != '' ? '오늘 자살하면 흔적을 찾기 힘들겠네요!' : '오늘 갑천다이빙은 추천 안드려요..';
    console.log(weatherData)
    console.log('날씨 불러옴',url);
    const weather2 = `**${area}**의 **${weatherDay}** 날씨 정보입니다!
- 평균 기온: ${temp}°C
- 최고 기온: ${maxTemp}°C
- 평균 습도: ${steam}%
- 평균 강수량: ${rain}mm
**${unjiWeather}**`;
    return weather2;
  } catch (error) {
    console.error('날씨 API 요청 중 에러 발생:', error);
    return error;
  }
}

const cctv = async () => {
  
}

// 봇 로그인 시 동작
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// 슬래시 명령어 처리
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === '현재시각') {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    await interaction.reply(`현재 시각은 ${currentHour}시 ${currentMinute}분입니다.`);
  }
  if (commandName === '이모지') {
    await interaction.reply('테스트 이모지: <:test:1369318687466848426>');
  }

  if (commandName === '애교') {
    await interaction.channel.send('https://tenor.com/view/onii-chan-wa-oshimai-mahiro-neko-cute-kawaii-gif-10704211514396564869');
  }

  //  if (commandName === '갑천근황') {
  //   //  await interaction.reply('cctv 정보를 불러오는 중입니다! <a:imgLoad:1369674762246291456>').then(sentMessage => {
  //   const cctv = 'https://cctvsec.ktict.co.kr/60785/LUO/+IP7hevhYuUiSRvlZq+5M+ipTLavphcispvII/Pqbs6K8OomUL8cFgl3IWqv'
  //   //  }
  //   const wowURL = 'https://www.geumriver.go.kr/html/sumun/sumunPopup_wl.jsp?deptcode=01&code=3009675&ymdhm=2025060140810&type=hour';
  //   interaction.reply(cctv);
  // }

  if (commandName === '갑천근황') {

    await interaction.deferReply(); // "로딩중..." 상태 표시

    const res = await fetch(cctv);
    const buffer = await res.arrayBuffer();
    const filePath = path.join('./cctv.mp4');
    fs.writeFileSync(filePath, Buffer.from(buffer));

    await interaction.editReply({
      content: "🎥 갑천 CCTV 근황입니다!",
      files: [filePath],
    });

    fs.unlinkSync(filePath);
  }

  if (commandName === '자살') {
    // 메시지 보내고 그 결과를 변수에 저장
  await interaction.reply('잠시만 기다려 주세요! <a:imgLoad:1369674762246291456>').then(sentMessage => {
    // API 요청 실행 및 메시지 수정
    unji().then(response => {
      sentMessage.edit(response);
    }).catch(error => {
      console.error('unji 함수 실행 중 오류:', error);
      sentMessage.edit('죄송합니다, 정보를 가져오는 중에 오류가 발생했습니다.');
    });
  });
  }
  if (commandName === '날씨') {
    // 메시지 보내고 그 결과를 변수에 저장
  await interaction.reply('날씨 정보를 불러오고 있어요! <a:imgLoad:1369674762246291456>').then(sentMessage => {
    // API 요청 실행 및 메시지 수정
    weather().then(response => {
      if (response.includes('0mm')){
        interaction.channel.send({
          files: [gapcheon2],
        });
      }else{
        interaction.channel.send({
          files: [gapcheon],
          content: '풍덩!!!',
        });
      }
      sentMessage.edit(response);
    }).catch(error => {
      console.error('weather 함수 실행 중 오류:', error);
      sentMessage.edit('죄송합니다, 정보를 가져오는 중에 오류가 발생했습니다.');
    });
  });
  }
});

const emotion = async () => {
  try{
    const res = await axios.get('https://korean-advice-open-api.vercel.app/api/advice');
    const { author, authorProfile, message } = res.data;
    const content = [];
    content.push(`**${author}** 님이 이런말을 하셨죠..`);
    content.push(`"${message}"`);
    return content[0]+content[1];
  }catch (error) {
    console.error('감정 API 요청 중 에러 발생:', error);
    const content = [
  "당신의 마음을 다 이해할 순 없지만, 혼자라고 느끼지 않으셨으면 좋겠습니다.",
  "제가 당신의 아픔을 모두 이해하진 못하지만, 곁에 있으려 합니다.",
  "지금 많이 지치셨을지도 모르겠지만, 저는 당신이 여기 있다는 걸 알아요.",
  "전부는 아니더라도, 당신의 말에 귀 기울이고 싶습니다.",
  "혼자서 다 이겨내려 하지 않으셔도 괜찮아요.",
  "천천히, 괜찮아질 때까지 기다릴게요. 당신은 충분히 소중한 분이에요.",
  "당장은 힘들어도, 당신이 얼마나 잘 버티고 있는지 알고 있습니다.",
  ];
  const index = Math.floor(Math.random() * content.length);
    return ['흠....',content[index], null];
  }
}

// 메시지 기반 명령어 처리
client.on('messageCreate', (message) => {
  if (message.content === '핑') {
    message.reply('퐁!');
  }
   if (message.content === '운') {
     message.reply('지!🐨');
   }
  if (message.content === '안녕' || message.content === 'ㅎㅇ') {
    message.reply('안녕하세요!');
  }

  if (message.content === '갑천아') {
    message.reply('삶이 힘들때 말씀해 주세요! 제가 도와드릴게요!');
  }

  if (message.content === '갑천아 고민'){
    if (message.content === '갑천아 고민') {
    emotion().then(emotionData => {
      message.reply(emotionData);
    }).catch(err => {
      console.error(err);
      message.reply('잠시 후에 다시 시도해 주세요.');
    });
    }
  }

  if(message.content === '갑천아 애교'){
    message.channel.send('https://tenor.com/view/onii-chan-wa-oshimai-mahiro-neko-cute-kawaii-gif-10704211514396564869');
  }

  if (message.content === '갑천아 힘들어' || message.content === '갑천아 도와줘' || message.content === '갑천아 나 힘들어') {
    // 메시지 보내고 그 결과를 변수에 저장
  message.reply('잠시만 기다려 주세요! <a:imgLoad:1369674762246291456>').then(sentMessage => {
    // API 요청 실행 및 메시지 수정
    unji().then(response => {
      sentMessage.edit(response);
    }).catch(error => {
      console.error('unji 함수 실행 중 오류:', error);
      sentMessage.edit('죄송합니다, 정보를 가져오는 중에 오류가 발생했습니다.');
    });
  });
  }
  if (message.content === '갑천아 자살' || message.content === '갑천아 운지') {
    message.reply('자살은 정말 안돼요! 힘든 일이 있으면 언제든지 말씀해 주세요!');
  }
  if (message.content === '갑천아 김찬') {
    message.reply('ㄱㅂㅇ ㄱㅇ~🤯');
  }
  if (message.content === '갑천아 채홍' || message.content === '갑천아 민채홍') {
    message.reply('만날 운지운지 거리는 애 말씀하시는건가요!?');
  }

  if (message.content === '갑천아 니위치') {
    message.reply(`## 🌊 갑천봇 위치 정보

**충청남도 금산군 대둔산**(해발 878m)에서 시작돼서,  
**대전광역시 도심을 가로질러 흐르다가 금강으로 합류하는 하천**입니다.

- 삶이 힘들때 언제나 말씀해주세요!
`);
  }
  if (message.author.id === '1285566586257674240') {
    if (message.content.includes('∮')) {
      const args = message.content.split('∮');

      const channelId = args[0];
      const content = args[1];

      client.channels.fetch(channelId).then(channel => {
        if (channel && channel.isTextBased()) {
          channel.send(content);
        } else {
          message.reply('해당 채널이 존재하지 않거나 텍스트 채널이 아닙니다.');
        }
      }).catch(err => {
        console.error('채널 전송 오류:', err);
        message.reply('채널을 찾는 도중 오류가 발생했습니다.');
      });
    }
  }

  if(message.content === '갑천아 뛰어') {
    const file = new AttachmentBuilder('./images/jump.jpg');
    message.channel.send({
      content: '풍덩!!!',
      files: [file],
    });
  }

  // if (message.content === '현재시각') {
  //   const currentDate = new Date();
  //   const currentHour = currentDate.getHours();
  //   const currentMinute = currentDate.getMinutes();
  //   message.reply(`현재 시각은 ${currentHour}시 ${currentMinute}분입니다.`);
  // }
});

const prefix = '!*';

client.on('messageCreate', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift();

  // 숫자인지 확인
  if (!isNaN(command)) {
    let count = 0; 
    const number = parseInt(command, 10);
    if(number <= 10){
      for (let i = 1; i <= number; i++) {
        let line = '';
        for (let j = 0; j < i; j++) {
          line += '⭐';
          count++;
        }
        message.channel.send(line);
      }
    }
    message.reply(`총 ${count}개의 별이 그려졌습니다.`);
  } else {
    message.channel.send(`숫자 아님: ${command}`);
  }
});

client.login(TOKEN);
