export interface Question {
  id: number;
  definition: string;
  answer: string;
  direction: 'horizontal' | 'vertical';
}

export const questions: Question[] = [
  {
    id: 1,
    definition: 'تقديم أفكار جديدة لحل المشكلات',
    answer: 'الابتكار',
    direction: 'horizontal',
  },
  {
    id: 2,
    definition: 'الالتزام بالمهام والقيام بها بأمانة',
    answer: 'المسؤولية',
    direction: 'vertical',
  },
  {
    id: 3,
    definition: 'العمل مع الآخرين لتحقيق هدف مشترك',
    answer: 'التعاون',
    direction: 'horizontal',
  },
  {
    id: 4,
    definition: 'الحرص على إنجاز العمل بكفاءة ودقة',
    answer: 'الإتقان',
    direction: 'vertical',
  },
  {
    id: 5,
    definition: 'احترام القواعد والتصرف وفق المبادئ الأخلاقية',
    answer: 'النزاهة',
    direction: 'horizontal',
  },
  {
    id: 6,
    definition: 'القدرة على التكيف مع التغيير وتقبله',
    answer: 'المرونة',
    direction: 'vertical',
  },
  {
    id: 7,
    definition: 'الإنصات وفهم الآخر قبل الرد',
    answer: 'الاستماع',
    direction: 'horizontal',
  },
  {
    id: 8,
    definition: 'التصرف بلباقة واحترام في بيئة العمل',
    answer: 'الاحترام',
    direction: 'vertical',
  },
  {
    id: 9,
    definition: 'استخدام الوقت بشكل فعال',
    answer: 'إدارة الوقت',
    direction: 'horizontal',
  },
  {
    id: 10,
    definition: 'تقدير وجهات النظر المختلفة والتنوع',
    answer: 'الشمولية',
    direction: 'vertical',
  },
];
