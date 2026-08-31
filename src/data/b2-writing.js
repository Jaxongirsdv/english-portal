export const B2_WRITING_PARTS = [
  {
    id: 'writing-part-1',
    number: 1,
    title: 'Два email по одной ситуации',
    minutes: 30,
    prompt: 'Your local sports centre will close the swimming pool for six weeks. Members may use a partner centre across town. Write to a friend who trains with you, then write to the sports centre manager.',
    fields: [
      { id: 'informal', label: 'Informal email другу', minWords: 45, maxWords: 60, task: 'Explain the closure, say how you feel and suggest what you should do together.' },
      { id: 'formal', label: 'Formal email руководителю', minWords: 120, maxWords: 150, task: 'Explain how the closure affects you, ask two practical questions and propose one solution.' },
    ],
  },
  {
    id: 'writing-part-2',
    number: 2,
    title: 'Текст для онлайн-издания',
    minutes: 30,
    prompt: 'An online youth magazine asks: “Does technology help people use their free time better, or does it make free time less meaningful?” Write an article giving your view and examples.',
    fields: [
      { id: 'article', label: 'Article / blog post', minWords: 180, maxWords: 200, task: 'Give a clear position, discuss both sides, include an example and finish with a conclusion.' },
    ],
  },
];

export const B2_WRITING_RUBRIC = [
  'Все пункты задания раскрыты',
  'Стиль подходит адресату и формату',
  'Абзацы и связки делают текст логичным',
  'Есть разнообразная лексика и конструкции B2',
  'Проверены времена, артикли, окончания и орфография',
];
