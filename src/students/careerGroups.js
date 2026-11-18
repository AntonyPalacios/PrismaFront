/**
 * The career groups of the student list (agreements of 2026-11-17): one per
 * exam type, named after the active careers that point at it — "Ciencias
 * (Biomédica y Ciencias)", "Letras (Artes, Derecho y Letras)" —, by exam
 * type. A new career falls into its group by itself. Each group is
 * { value: the exam type id as text, label }.
 */
export function careerGroups(careers = []) {
  const groups = new Map();
  careers
    .filter((career) => career.active && career.examTypeId != null)
    .forEach((career) => {
      const group = groups.get(career.examTypeId) ?? { examTypeId: career.examTypeId, examTypeName: career.examTypeName, careers: [] };
      group.careers.push(career.name);
      groups.set(career.examTypeId, group);
    });
  return [...groups.values()]
    .sort((a, b) => a.examTypeName.localeCompare(b.examTypeName, 'es'))
    .map(({ examTypeId, examTypeName, careers: names }) => {
      const only = names.length === 1 && names[0] === examTypeName;
      const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names.at(-1)}` : names[0];
      return { value: String(examTypeId), label: only ? examTypeName : `${examTypeName} (${list})` };
    });
}
