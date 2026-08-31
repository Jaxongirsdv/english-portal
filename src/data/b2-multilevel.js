export const MULTILEVEL_FORMAT = {
  Reading: { minutes: 60, parts: 5, questions: 35 },
  Listening: { minutes: 45, parts: 6, questions: 35, plays: 2 },
};

export const B2_READING_PARTS = [
  {
    id: 'reading-part-1',
    number: 1,
    title: 'Связность текста',
    format: '6 пропусков · одно слово',
    minutes: 10,
    officialNote: 'Тренировка типа Part 1: короткий текст и одно слово в каждый пропуск.',
    passage: [
      'Libraries have traditionally been places where people borrow books. In recent years, however, some libraries have started lending useful objects as [1]. This new service is often called a “library of things”.',
      'The idea is simple: people do not need to buy equipment [2] they only use occasionally. Instead, they can borrow a drill, a sewing machine or camping equipment for a few days. This saves money and prevents useful items [3] sitting unused in cupboards.',
      'Before an object can be borrowed, staff check that it is safe and explain [4] to use it. Members are usually expected to return everything [5] time and in good condition. If the service continues to grow, libraries may become even [6] important to their local communities.',
    ],
    questions: [
      { id: 'r1-1', type: 'input', prompt: 'started lending useful objects as ___', answers: ['well'], explanation: 'Устойчивое выражение as well означает «тоже».' },
      { id: 'r1-2', type: 'input', prompt: 'equipment ___ they only use occasionally', answers: ['that', 'which'], explanation: 'Нужно относительное местоимение that или which.' },
      { id: 'r1-3', type: 'input', prompt: 'prevents useful items ___ sitting unused', answers: ['from'], explanation: 'После prevent используется конструкция prevent something from doing.' },
      { id: 'r1-4', type: 'input', prompt: 'explain ___ to use it', answers: ['how'], explanation: 'How вводит объяснение способа действия.' },
      { id: 'r1-5', type: 'input', prompt: 'return everything ___ time', answers: ['on'], explanation: 'On time означает «вовремя».' },
      { id: 'r1-6', type: 'input', prompt: 'become even ___ important', answers: ['more'], explanation: 'More образует сравнительную степень многосложного прилагательного.' },
    ],
  },
  READING_PART_2,
  READING_PART_3,
  {
    id: 'reading-part-4',
    number: 4,
    title: 'Детали и скрытый смысл',
    format: '4 варианта + True / False / Not Given',
    minutes: 18,
    officialNote: 'Сокращённая тренировка типа Part 4: понимание деталей, вывода автора и неуказанной информации.',
    passage: [
      'For decades, city planners treated trees mainly as decoration. A line of trees made a street attractive, but roads, parking spaces and buildings usually received priority. That view is changing. As cities become hotter and more crowded, researchers are paying closer attention to the practical work performed by urban trees.',
      'The most obvious benefit is shade. Measurements taken on neighbouring streets can show large temperature differences when one has mature trees and the other does not. Leaves also release water into the air, which can cool the surrounding area. This matters during heatwaves, when concrete and asphalt store heat during the day and release it slowly at night.',
      'Trees can also reduce pressure on drainage systems. During heavy rain, leaves and branches temporarily hold some water, while roots help the soil absorb more of it. They cannot prevent every flood, especially when drains are blocked or rainfall is extreme. Nevertheless, a connected network of parks, gardens and planted streets can form part of a wider flood-management plan.',
      'The benefits are not distributed equally. Wealthier districts often have older, larger trees, while neighbourhoods with fewer resources may have little shade. Planting thousands of young trees sounds like a quick solution, but a sapling does not provide the same cooling as a mature tree. Young trees need years of watering, protection and maintenance before they deliver their full value.',
      'Poorly planned planting can create new problems. A species that grows well in one climate may struggle in another. Roots can damage pavements when there is too little space, and pollen from some species may affect people with allergies. Successful programmes therefore choose several suitable species and involve residents in decisions about location and care.',
      'Urban forestry is not a replacement for reducing emissions or improving buildings. It is one tool among many. Its strength is that the same investment can address several problems at once: heat, rainfall, air quality and public wellbeing. The difficult part is not planting a tree for a photograph. It is protecting that tree long enough for the city to receive the benefits promised at the beginning.',
    ],
    questions: [
      { id: 'r4-1', type: 'choice', prompt: 'What change in attitude does the first paragraph describe?', options: ['Trees are now seen as useful infrastructure.', 'Trees are being removed to create parking.', 'Decoration has become the main planning goal.', 'Researchers no longer study city temperatures.'], answer: 'Trees are now seen as useful infrastructure.', explanation: 'Автор противопоставляет прежнее отношение как к украшению современной оценке практической пользы.' },
      { id: 'r4-2', type: 'choice', prompt: 'Why are mature trees especially valuable during heatwaves?', options: ['They cool streets through shade and released moisture.', 'They prevent buildings from storing any heat.', 'They make heatwaves shorter.', 'They require no water during hot weather.'], answer: 'They cool streets through shade and released moisture.', explanation: 'Во втором абзаце прямо названы shade и release water into the air.' },
      { id: 'r4-3', type: 'choice', prompt: 'What does the author suggest about flood prevention?', options: ['Trees should be one part of a broader plan.', 'Trees can stop every urban flood.', 'Drainage systems are no longer necessary.', 'Only private gardens absorb rainwater.'], answer: 'Trees should be one part of a broader plan.', explanation: 'Деревья названы частью wider flood-management plan, а не полной заменой дренажу.' },
      { id: 'r4-4', type: 'choice', prompt: 'What is the central warning in the final paragraph?', options: ['Planting is easier than long-term protection.', 'Cities should use only one tree species.', 'Photographs reduce public support.', 'Building improvement is unnecessary.'], answer: 'Planting is easier than long-term protection.', explanation: 'Финальная мысль подчёркивает необходимость защищать дерево достаточно долго.' },
      { id: 'r4-5', type: 'choice', prompt: 'Urban trees were always given priority over roads and buildings.', options: ['True', 'False', 'Not Given'], answer: 'False', explanation: 'В первом абзаце сказано обратное: roads, parking spaces and buildings usually received priority.' },
      { id: 'r4-6', type: 'choice', prompt: 'Concrete can continue warming the city after sunset.', options: ['True', 'False', 'Not Given'], answer: 'True', explanation: 'Асфальт и бетон сохраняют тепло днём и медленно отдают его ночью.' },
      { id: 'r4-7', type: 'choice', prompt: 'Every district in a city has approximately the same amount of shade.', options: ['True', 'False', 'Not Given'], answer: 'False', explanation: 'Четвёртый абзац описывает неравномерное распределение деревьев и тени.' },
      { id: 'r4-8', type: 'choice', prompt: 'The article states the exact number of years a sapling needs to mature.', options: ['True', 'False', 'Not Given'], answer: 'Not Given', explanation: 'Сказано только «years»; точное число не приводится.' },
      { id: 'r4-9', type: 'choice', prompt: 'Residents are always responsible for watering new trees.', options: ['True', 'False', 'Not Given'], answer: 'Not Given', explanation: 'Жителей предлагают вовлекать в решения, но обязательная ответственность за полив не указана.' },
    ],
  },
  READING_PART_5,
];

export const B2_LISTENING_PARTS = [
  {
    id: 'listening-part-1',
    number: 1,
    title: 'Заверши короткий диалог',
    format: '8 реплик · 3 варианта',
    minutes: 8,
    officialNote: 'Тренировка типа Part 1: услышь первую реплику и выбери естественный ответ.',
    questions: [
      { id: 'l1-1', type: 'choice', audioSrc: 'audio/b2/l1-1.wav', audio: 'I am afraid the eight fifteen train has been cancelled.', prompt: 'Как лучше продолжить диалог?', options: ['Then I will take the next one.', 'I travelled there yesterday.', 'The station is very modern.'], answer: 'Then I will take the next one.', explanation: 'Ответ должен реагировать на отмену поезда и предлагать следующее действие.' },
      { id: 'l1-2', type: 'choice', audioSrc: 'audio/b2/l1-2.wav', audio: 'Would you mind sending me the revised report by noon?', prompt: 'Как лучше продолжить диалог?', options: ['Not at all. I will finish it this morning.', 'The report was twenty pages.', 'Noon is the middle of the day.'], answer: 'Not at all. I will finish it this morning.', explanation: 'Would you mind требует согласия или отказа выполнить просьбу.' },
      { id: 'l1-3', type: 'choice', audioSrc: 'audio/b2/l1-3.wav', audio: 'This soup tastes much spicier than it did last time.', prompt: 'Как лучше продолжить диалог?', options: ['I may have added too much chilli.', 'We booked the table online.', 'The bowl is on the shelf.'], answer: 'I may have added too much chilli.', explanation: 'Реплика объясняет причину более острого вкуса.' },
      { id: 'l1-4', type: 'choice', audioSrc: 'audio/b2/l1-4.wav', audio: 'I cannot decide whether to accept the job offer abroad.', prompt: 'Как лучше продолжить диалог?', options: ['Why not list the advantages and disadvantages?', 'The office closes at six.', 'Your passport is in the drawer.'], answer: 'Why not list the advantages and disadvantages?', explanation: 'Совет логично отвечает на затруднение при выборе.' },
      { id: 'l1-5', type: 'choice', audioSrc: 'audio/b2/l1-5.wav', audio: 'Excuse me, is anyone sitting here?', prompt: 'Как лучше продолжить диалог?', options: ['No, please go ahead.', 'I usually sit near the window.', 'The meeting lasted an hour.'], answer: 'No, please go ahead.', explanation: 'Это стандартный ответ на просьбу занять свободное место.' },
      { id: 'l1-6', type: 'choice', audioSrc: 'audio/b2/l1-6.wav', audio: 'The parcel should have arrived three days ago.', prompt: 'Как лучше продолжить диалог?', options: ['Let me check the tracking number for you.', 'It was wrapped in brown paper.', 'Three days can feel quite long.'], answer: 'Let me check the tracking number for you.', explanation: 'Сотрудник предлагает конкретное решение проблемы доставки.' },
      { id: 'l1-7', type: 'choice', audioSrc: 'audio/b2/l1-7.wav', audio: 'You look exhausted. Were you working late again?', prompt: 'Как лучше продолжить диалог?', options: ['Yes, we had to meet a deadline.', 'My workplace is near the bank.', 'I prefer tea without sugar.'], answer: 'Yes, we had to meet a deadline.', explanation: 'Ответ объясняет усталость и позднюю работу.' },
      { id: 'l1-8', type: 'choice', audioSrc: 'audio/b2/l1-8.wav', audio: 'Could you tell me where the nearest pharmacy is?', prompt: 'Как лучше продолжить диалог?', options: ['Go straight and turn left at the lights.', 'I bought this medicine last week.', 'The doctor was very helpful.'], answer: 'Go straight and turn left at the lights.', explanation: 'Вопрос просит указать направление.' },
    ],
  },
  {
    id: 'listening-part-2',
    number: 2,
    title: 'Информация из монолога',
    format: '6 пропусков · слово или число',
    minutes: 9,
    officialNote: 'Тренировка типа Part 2: прослушай монолог дважды и заполни пропуски.',
    audioSrc: 'audio/b2/listening-part-2.wav',
    audio: 'Welcome to the Green Street community garden. Before we begin, I would like to explain how the project works. The garden was created in 2019 on land that had been empty for almost a decade. Today, more than forty local families grow vegetables and flowers here. New volunteers meet every Saturday at nine thirty beside the wooden gate. You do not need gardening experience, but please bring strong gloves because we have only a few spare pairs. During your first visit, a coordinator will show you how to use the tools safely and introduce you to your team. Most volunteers spend two hours in the garden. In summer, we also need people on Wednesday evenings because the plants require more water. Everything we grow is shared. Half goes to the volunteers, while the other half is delivered to a nearby food bank. Last year we donated over three hundred kilograms of fresh produce. If the weather is bad, check our website before leaving home. We normally post a cancellation notice by eight o clock. Finally, anyone under sixteen must come with an adult. If you would like to join, complete the short form on our website and choose the date of your first visit.',
    questions: [
      { id: 'l2-1', type: 'input', prompt: 'The garden was created in ___.', answers: ['2019'], explanation: 'В начале записи сказано: created in 2019.' },
      { id: 'l2-2', type: 'input', prompt: 'Volunteers meet beside the wooden ___.', answers: ['gate'], explanation: 'Место встречи: beside the wooden gate.' },
      { id: 'l2-3', type: 'input', prompt: 'New volunteers should bring strong ___.', answers: ['gloves'], explanation: 'Организатор просит принести strong gloves.' },
      { id: 'l2-4', type: 'input', prompt: 'Most people work in the garden for ___ hours.', answers: ['2', 'two'], explanation: 'Обычная смена длится two hours.' },
      { id: 'l2-5', type: 'input', prompt: 'Half of the produce is sent to a food ___.', answers: ['bank'], explanation: 'Половину урожая доставляют в nearby food bank.' },
      { id: 'l2-6', type: 'input', prompt: 'People under ___ must be accompanied by an adult.', answers: ['16', 'sixteen'], explanation: 'В конце записи указано: anyone under sixteen.' },
    ],
  },
  LISTENING_PART_3,
  LISTENING_PART_4,
  LISTENING_PART_5,
  LISTENING_PART_6,
];

export const B2_OBJECTIVE_PARTS = {
  Reading: B2_READING_PARTS,
  Listening: B2_LISTENING_PARTS,
};

export function b2Part(skill, id) {
  return B2_OBJECTIVE_PARTS[skill]?.find((part) => part.id === id) || null;
}
import {
  LISTENING_PART_3,
  LISTENING_PART_4,
  LISTENING_PART_5,
  LISTENING_PART_6,
  READING_PART_2,
  READING_PART_3,
  READING_PART_5,
} from './b2-multilevel-extra.js';
