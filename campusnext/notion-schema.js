export const opportunitySchema = {
  Title: {title: {}}, 'Application ID': {rich_text: {}},
  'Event date': {date: {}}, Deadline: {date: {}}, Published: {checkbox: {}}, Organizer: {rich_text: {}},
  Category: {select: {options: ['Community', 'Hackathon', 'Workshop', 'Competition', 'Opportunity'].map(name => ({name}))}},
  ...Object.fromEntries(['Description', 'Venue', 'Eligibility', 'Requirements', 'Source', 'Source text', 'Team need'].map(name => [name, {rich_text: {}}])),
  ...Object.fromEntries(['Food', 'Goodies'].flatMap(perk => [
    [`${perk} status`, {select: {options: ['Provided', 'Not announced', 'Not provided'].map(name => ({name}))}}],
    [`${perk} details`, {rich_text: {}}], [`${perk} conditions`, {rich_text: {}}],
    [`${perk} availability`, {select: {options: ['Available', 'Unknown', 'Exhausted', 'Withdrawn'].map(name => ({name}))}}],
    [`${perk} verified`, {checkbox: {}}],
    [`${perk} type`, {select: {options: ['Included benefit', 'Competition prize'].map(name => ({name}))}}]
  ]))
};
export function missingSchemaFields(dataSource) {
  return Object.entries(opportunitySchema).filter(([name, schema]) => dataSource.properties?.[name]?.type !== Object.keys(schema)[0])
    .map(([name, schema]) => `${name} (${Object.keys(schema)[0]})`);
}
