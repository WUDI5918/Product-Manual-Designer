import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../../App';
import { Template, Project, ComponentType } from '../../constants';

// Mock local storage
const localStorageMock = (() => {
  let store: { [key:string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
    localStorage.clear();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
});

describe('App component', () => {
  it('should delete a template from all projects', async () => {
    // 1. Create a template and a project that uses it
    const template: Template = {
      id: 'template-1',
      name: 'Test Template',
      category: 'Custom',
      tags: [],
      page: { header: [], body: [], footer: [] },
    };
    const project: Project = {
      id: 'project-1',
      name: 'Test Project',
      lastModified: Date.now(),
      state: {
        projectName: 'Test Project',
        pages: [],
        currentPageIndex: 0,
        selectedComponentId: null,
        gridSize: 20,
        isGridVisible: true,
        isSnapToGridEnabled: true,
        templates: [template],
        assets: {
          images: [],
          icons: [],
          brandKit: { logo: null, colors: [], fonts: [] },
        },
        documentSettings: {} as any,
      },
    };

    localStorage.setItem('customTemplates', JSON.stringify([template]));
    localStorage.setItem('manualProjects', JSON.stringify([project]));

    render(<App />);

    // 2. Go to the template manager and delete the template
    fireEvent.click(screen.getByText('Template Library'));
    await waitFor(() => screen.getByText('Test Template'));
    fireEvent.click(screen.getByTestId('delete-template-template-1'));

    // 3. Verify the template is removed from the project
    await waitFor(() => {
        const updatedProjects = JSON.parse(localStorage.getItem('manualProjects')!);
        expect(updatedProjects[0].state.templates).toHaveLength(0);
    });
  });

  it('should update a template in all projects when saved', async () => {
    // 1. Setup: a "master" template list with an updated template page,
    // and a project with an older version of the template page.
    const masterTemplate: Template = {
      id: 'template-2',
      name: 'Editable Template',
      category: 'Custom',
      tags: [],
      page: { header: [{id: 'comp1', type: ComponentType.Text, x:0, y:0, width:100, height: 40, props: {text: 'Updated'}}], body: [], footer: [] },
    };

    const projectTemplate: Template = {
        id: 'template-2',
        name: 'Editable Template',
        category: 'Custom',
        tags: [],
        page: { header: [], body: [], footer: [] }, // old version is empty
    };

    const project: Project = {
      id: 'project-2',
      name: 'Another Project',
      lastModified: Date.now(),
      state: {
        projectName: 'Another Project',
        pages: [],
        currentPageIndex: 0,
        selectedComponentId: null,
        gridSize: 20,
        isGridVisible: true,
        isSnapToGridEnabled: true,
        templates: [projectTemplate],
        assets: {
          images: [],
          icons: [],
          brandKit: { logo: null, colors: [], fonts: [] },
        },
        documentSettings: {} as any,
      },
    };

    localStorage.setItem('customTemplates', JSON.stringify([masterTemplate]));
    localStorage.setItem('manualProjects', JSON.stringify([project]));

    render(<App />);

    // 2. Go to the template manager and edit the template
    fireEvent.click(screen.getByText('Template Library'));
    await waitFor(() => screen.getByText('Editable Template'));
    fireEvent.click(screen.getByTestId('edit-template-template-2'));

    // 3. In the editor, click "Save Template". This will save the "master" version's
    // page content and propagate it to the project.
    await waitFor(() => screen.getByText('Save Template'));
    fireEvent.click(screen.getByText('Save Template'));

    // 4. Verify the template in the project has been updated.
    await waitFor(() => {
        const updatedProjects = JSON.parse(localStorage.getItem('manualProjects')!);
        const updatedProjectTemplate = updatedProjects[0].state.templates[0];
        expect(updatedProjectTemplate.page.header).toHaveLength(1);
        expect(updatedProjectTemplate.page.header[0].props.text).toBe('Updated');
    });
  });
});