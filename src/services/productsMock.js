export const productsMock = [
  // ===== UNIFORMES ANTIFLUIDO (Lafayette) =====
  {
    id: "uf-enf-001",
    line: "antifluido",
    category: "Enfermería",
    subcategory: "Pijama",
    name: "Pijama antifluido clásica",
    price: 135000,
    description:
      "Uniforme en tela antifluido Lafayette. Cómodo, resistente y pensado para jornadas largas.",
    images: ["/img/uf-enf-001-1.jpg", "/img/uf-enf-001-2.jpg"],
    variants: [
      { size: "S", color: "Azul", available: true },
      { size: "M", color: "Azul", available: true },
      { size: "L", color: "Azul", available: false },
      { size: "M", color: "Blanco", available: true },
    ],
    tags: ["lafayette", "antifluido", "salud"],
  },
  {
    id: "uf-den-001",
    line: "antifluido",
    category: "Dental",
    subcategory: "Filipina",
    name: "Filipina antifluido premium",
    price: 125000,
    description:
      "Filipina profesional en antifluido Lafayette. Excelente presentación y fácil cuidado.",
    images: ["/img/uf-den-001-1.jpg"],
    variants: [
      { size: "S", color: "Negro", available: true },
      { size: "M", color: "Negro", available: true },
      { size: "L", color: "Negro", available: true },
      { size: "XL", color: "Negro", available: false },
    ],
    tags: ["lafayette", "antifluido", "dental"],
  },
  {
    id: "uf-vet-001",
    line: "antifluido",
    category: "Veterinaria",
    subcategory: "Bata",
    name: "Bata antifluido manga larga",
    price: 145000,
    description:
      "Bata antifluido Lafayette para trabajo veterinario. Protección y comodidad.",
    images: ["/img/uf-vet-001-1.jpg"],
    variants: [
      { size: "S", color: "Verde", available: true },
      { size: "M", color: "Verde", available: true },
      { size: "L", color: "Verde", available: true },
    ],
    tags: ["lafayette", "antifluido", "veterinaria"],
  },

  // ===== LINO ARTESANAL =====
  {
    id: "ln-blu-001",
    line: "lino",
    category: "Camisas/Blusas",
    subcategory: "Blusa",
    name: "Blusa lino artesanal",
    price: 160000,
    description:
      "Tela natural transpirable con propuesta artesanal. Fresca, suave y elegante.",
    images: ["/img/ln-blu-001-1.jpg", "/img/ln-blu-001-2.jpg"],
    variants: [
      { size: "S", color: "Natural", available: true },
      { size: "M", color: "Natural", available: true },
      { size: "L", color: "Natural", available: false },
      { size: "M", color: "Arena", available: true },
    ],
    tags: ["lino", "artesanal", "natural"],
  },
  {
    id: "ln-pan-001",
    line: "lino",
    category: "Pantalones",
    subcategory: "Pantalón",
    name: "Pantalón lino recto",
    price: 190000,
    description:
      "Pantalón en lino natural, transpirable y cómodo. Corte recto de uso diario.",
    images: ["/img/ln-pan-001-1.jpg"],
    variants: [
      { size: "S", color: "Natural", available: true },
      { size: "M", color: "Natural", available: true },
      { size: "L", color: "Natural", available: true },
    ],
    tags: ["lino", "artesanal", "transpirable"],
  },
  {
    id: "ln-fal-001",
    line: "lino",
    category: "Faldas",
    subcategory: "Falda",
    name: "Falda lino artesanal",
    price: 175000,
    description:
      "Falda fresca en lino natural con acabado artesanal. Ideal para climas cálidos.",
    images: ["/img/ln-fal-001-1.jpg"],
    variants: [
      { size: "S", color: "Beige", available: true },
      { size: "M", color: "Beige", available: true },
      { size: "L", color: "Beige", available: false },
    ],
    tags: ["lino", "natural", "artesanal"],
  },
];
