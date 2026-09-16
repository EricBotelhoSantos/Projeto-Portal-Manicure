/**
 * Configuração central do site.
 * Altere aqui WhatsApp, Instagram, endereço, horários, serviços,
 * depoimentos e imagens da galeria — nada disso está fixo nos componentes.
 */

import estudio from "@/assets/estudio.jpg";
import galeria1 from "@/assets/galeria-1.png";
import galeria2 from "@/assets/galeria-2.png";
import galeria3 from "@/assets/galeria-3.png";
import galeria4 from "@/assets/galeria-4.jpg";
import galeria5 from "@/assets/galeria-5.jpg";
import galeria6 from "@/assets/galeria-6.jpg";
import galeria7 from "@/assets/galeria-7.jpg";
import galeria8 from "@/assets/galeria-8.jpg";
import galeria9 from "@/assets/galeria-9.jpg";

export const site = {
  nome: "Ana Paula Nails Designer",
  slogan: "Beleza, cuidado e sofisticação em cada detalhe.",

  // Contato
  whatsapp: {
    // Número em formato internacional, somente dígitos (55 + DDD + número)
    numero: "5585992476939",
    exibicao: "(85) 99247-6939",
  },
  instagram: {
    url: "https://www.instagram.com/paulanaills_",
    usuario: "@paulanaills_",
  },
  // Ainda não informados — preencha quando quiser exibir no site.
  endereco: "",
  horarios: "Atendimento com horário agendado.",

  // Mensagens pré-preenchidas do WhatsApp
  mensagens: {
    padrao:
      "Olá, Ana Paula! Gostaria de agendar um horário para fazer minhas unhas. Poderia me informar os horários disponíveis?",
    flutuante: "Olá, Ana Paula! Vi seu site e gostaria de agendar um horário.",
    servico: (servico: string) =>
      `Olá, Ana Paula! Gostaria de agendar um horário para ${servico}. Poderia me informar os horários disponíveis?`,
  },
} as const;

export function whatsappLink(mensagem: string = site.mensagens.padrao) {
  return `https://wa.me/${site.whatsapp.numero}?text=${encodeURIComponent(mensagem)}`;
}

export type Servico = {
  nome: string;
  descricao: string;
  icone: "manicure" | "esmaltacao" | "alongamento" | "nailart" | "manutencao" | "spa";
};

export const servicos: Servico[] = [
  {
    nome: "Manicure",
    descricao: "Cuidados completos para suas mãos e unhas, com acabamento impecável.",
    icone: "manicure",
  },
  {
    nome: "Esmaltação",
    descricao: "Aplicação cuidadosa com acabamento uniforme e duradouro.",
    icone: "esmaltacao",
  },
  {
    nome: "Alongamento de Unhas",
    descricao: "Unhas alongadas com técnicas profissionais e resultado elegante.",
    icone: "alongamento",
  },
  {
    nome: "Nail Art",
    descricao: "Detalhes personalizados para deixar suas unhas únicas.",
    icone: "nailart",
  },
  {
    nome: "Manutenção",
    descricao: "Cuidados para manter suas unhas bonitas e bem cuidadas.",
    icone: "manutencao",
  },
  {
    nome: "Spa das Mãos",
    descricao: "Um momento de cuidado e relaxamento para suas mãos.",
    icone: "spa",
  },
];

export const diferenciais = [
  "Atendimento personalizado",
  "Técnicas profissionais",
  "Cuidado e higiene",
  "Acabamento impecável",
  "Ambiente acolhedor",
];

/**
 * GALERIA — para trocar por novas fotos, basta substituir a imagem
 * em src/assets e atualizar o texto alternativo (alt).
 */
export const galeria = [
  { src: galeria1, alt: "Unhas em nude rosado com detalhes em glitter prateado" },
  { src: galeria2, alt: "Alongamento stiletto em esmalte vermelho intenso" },
  { src: galeria3, alt: "Unhas em degradê lilás com nail art de linhas brancas" },
  { src: galeria4, alt: "Francesinha branca com fio dourado em unhas amendoadas" },
  { src: galeria5, alt: "Alongamento longo em branco leitoso com brilho perolado" },
  { src: galeria6, alt: "Nail art delicada em nude com folhas de ouro" },
  { src: galeria7, alt: "Esmaltação em rosé escuro com acabamento brilhante" },
  { src: galeria8, alt: "Mãos com manicure nude após spa das mãos" },
  { src: galeria9, alt: "Efeito baby boomer em degradê branco e nude com glitter" },
];

export const estudioFoto = {
  src: estudio,
  alt: "Espaço de atendimento da Ana Paula Nails Designer",
};

/**
 * DEPOIMENTOS DE EXEMPLO
 * ⚠️ Estes textos são fictícios e servem apenas de exemplo.
 * Substitua pelos depoimentos reais das clientes.
 */
export const depoimentos = [
  {
    texto:
      "Meu atendimento foi maravilhoso! A Ana Paula é muito cuidadosa e o resultado ficou perfeito.",
    autora: "Cliente",
  },
  {
    texto: "Adorei minhas unhas! O acabamento ficou impecável e o atendimento foi excelente.",
    autora: "Cliente",
  },
  {
    texto: "Além do resultado lindo, o atendimento é muito acolhedor. Com certeza voltarei.",
    autora: "Cliente",
  },
];

export const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Serviços", href: "#servicos" },
  { label: "Sobre", href: "#sobre" },
  { label: "Galeria", href: "#galeria" },
  { label: "Contato", href: "#contato" },
];
