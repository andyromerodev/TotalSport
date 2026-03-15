export function slugifyCategory(category: string): string {
  return category.toLowerCase().replaceAll(' ', '-');
}
