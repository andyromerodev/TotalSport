export function buildWhatsAppLink(productName: string): string {
  const number = import.meta.env.PUBLIC_WHATSAPP_NUMBER;
  const encoded = encodeURIComponent(`Hola, me interesa este producto: ${productName}`);

  if (number) {
    return `https://wa.me/${number}?text=${encoded}`;
  }

  return `https://wa.me/?text=${encoded}`;
}
