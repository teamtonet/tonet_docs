/** The example call both call demos play: an AC repair booking, made up, with times in seconds. */
export type Lang = 'en' | 'es' | 'tl';
export type Line = { t: number; who: 'us' | 'them'; text: Record<Lang, string>; mark?: string };

export const lines: Line[] = [
  { t: 0, who: 'us', text: {
    en: 'Thanks for calling, this is the front desk. How can I help?',
    es: 'Gracias por llamar, habla la recepción. ¿En qué le puedo ayudar?',
    tl: 'Salamat sa pagtawag, front desk po ito. Paano ko po kayo matutulungan?' } },
  { t: 5, who: 'them', text: {
    en: 'Hi, my AC is blowing warm air. Can someone come take a look?',
    es: 'Hola, mi aire acondicionado echa aire caliente. ¿Puede venir alguien a revisarlo?',
    tl: 'Hi, mainit na hangin ang lumalabas sa AC ko. May puwede bang pumunta para tingnan ito?' } },
  { t: 12, who: 'us', text: {
    en: 'Sure. Is this for a home or a business?',
    es: 'Claro. ¿Es para una casa o un negocio?',
    tl: 'Sige po. Para po ba ito sa bahay o sa negosyo?' } },
  { t: 16, who: 'them', text: {
    en: 'Home. What does a visit cost?',
    es: 'Casa. ¿Cuánto cuesta la visita?',
    tl: 'Sa bahay. Magkano ang bisita?' } },
  { t: 21, who: 'us', mark: 'Price said', text: {
    en: 'A diagnostic visit is $89, and it goes toward the repair if you go ahead.',
    es: 'La visita de diagnóstico cuesta $89 y se descuenta de la reparación si decide hacerla.',
    tl: 'Ang diagnostic visit ay $89, at ibabawas ito sa repair kung itutuloy ninyo.' } },
  { t: 30, who: 'them', text: {
    en: 'OK. Do you have anything this week?',
    es: 'Bien. ¿Tienen algo esta semana?',
    tl: 'Okay. May bakante ba kayo ngayong linggo?' } },
  { t: 34, who: 'us', text: {
    en: 'Thursday at 10 AM is open. Want it?',
    es: 'El jueves a las 10 AM está libre. ¿Se lo reservo?',
    tl: 'Bakante po ang Huwebes, alas-10 ng umaga. Kukunin n’yo po ba?' } },
  { t: 38, who: 'them', text: {
    en: 'Yes, Thursday works.',
    es: 'Sí, el jueves me sirve.',
    tl: 'Oo, okay ang Huwebes.' } },
  { t: 41, who: 'us', mark: 'Next step', text: {
    en: "Booked. I'll text you a confirmation with the address we have on file.",
    es: 'Listo, reservado. Le envío un mensaje de confirmación con la dirección que tenemos registrada.',
    tl: 'Naka-book na po. Magte-text ako ng kumpirmasyon gamit ang address na nasa record namin.' } },
  { t: 48, who: 'them', text: {
    en: 'Great, thanks.',
    es: 'Perfecto, gracias.',
    tl: 'Sige, salamat.' } },
];
export const END = 52;

