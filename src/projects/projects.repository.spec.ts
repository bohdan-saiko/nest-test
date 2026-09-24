import { InMemoryProjectsRepository } from './projects.repository.js';

describe('InMemoryProjectsRepository', () => {
  it('does not throw when updating a project with an empty body', () => {
    const repository = new InMemoryProjectsRepository();
    const project = repository.create({
      name: 'Website',
      description: 'Redesign',
      status: 'active',
    });

    expect(repository.update(project.id)).toEqual(project);
  });
});
