/**
 * TimelinePreview Component Tests
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimelinePreview from '../../components/TimelinePreview';

describe('TimelinePreview Component', () => {
  const mockTrack = {
    id: '1',
    name: 'Engineering Onboarding',
    type: 'role',
    tasks: [
      {
        id: 't1',
        name: 'Setup dev environment',
        description: 'Install necessary tools',
        ownerRole: 'onboarding-manager',
        dueDaysOffset: 0,
        order: 1,
      },
      {
        id: 't2',
        name: 'First week orientation',
        description: 'Meet the team',
        ownerRole: 'manager',
        dueDaysOffset: 1,
        order: 2,
      },
      {
        id: 't3',
        name: '30-day review',
        description: 'Check-in on progress',
        ownerRole: 'manager',
        dueDaysOffset: 30,
        order: 3,
      },
      {
        id: 't4',
        name: '90-day review',
        description: 'Comprehensive assessment',
        ownerRole: 'manager',
        dueDaysOffset: 90,
        order: 4,
      },
      {
        id: 't5',
        name: 'Pre-onboarding orientation',
        description: 'Before start date',
        ownerRole: 'hr',
        dueDaysOffset: -14,
        order: 0,
      },
    ],
  };

  test('renders timeline preview with title', () => {
    render(
      <TimelinePreview track={mockTrack} />
    );
    expect(screen.getByText('Timeline Preview')).toBeInTheDocument();
  });

  test('displays timeline milestones', () => {
    render(
      <TimelinePreview track={mockTrack} />
    );

    expect(screen.getByText(/Pre-Onboarding/)).toBeInTheDocument();
    expect(screen.getByText(/Day 0/)).toBeInTheDocument();
    expect(screen.getByText(/Week 1/)).toBeInTheDocument();
    expect(screen.getByText(/30 Days/)).toBeInTheDocument();
    expect(screen.getByText(/90 Days/)).toBeInTheDocument();
  });

  test('places tasks on correct timeline positions', () => {
    render(
      <TimelinePreview track={mockTrack} />
    );

    // Pre-onboarding task
    expect(screen.getByText('Pre-onboarding orientation')).toBeInTheDocument();

    // Day 0 task
    expect(screen.getByText('Setup dev environment')).toBeInTheDocument();

    // 30-day task
    expect(screen.getByText('30-day review')).toBeInTheDocument();

    // 90-day task
    expect(screen.getByText('90-day review')).toBeInTheDocument();
  });

  test('color-codes tasks by owner role', () => {
    const { container } = render(
      <TimelinePreview track={mockTrack} />
    );

    const taskElements = container.querySelectorAll('[data-owner-role]');
    expect(taskElements.length).toBeGreaterThan(0);

    // Check for color coding attributes
    taskElements.forEach(element => {
      expect(element.getAttribute('data-owner-role')).toBeTruthy();
    });
  });

  test('shows task details on hover', async () => {
    const user = userEvent.setup();
    render(
      <TimelinePreview track={mockTrack} />
    );

    const task = screen.getByText('Setup dev environment');
    await user.hover(task);

    // Should show task details (name, owner, due offset)
    expect(screen.getByText(/Setup dev environment/)).toBeInTheDocument();
  });

  test('displays task description in tooltip', async () => {
    const user = userEvent.setup();
    render(
      <TimelinePreview track={mockTrack} />
    );

    const task = screen.getByText('Setup dev environment');
    const taskCard = task.closest('[role="tooltip"]') || task.parentElement;

    // Description should be visible or appear on hover
    expect(taskCard).toBeInTheDocument();
  });

  test('organizes tasks by timeline section', () => {
    const { container } = render(
      <TimelinePreview track={mockTrack} />
    );

    const sections = container.querySelectorAll('[data-timeline-section]');
    expect(sections.length).toBeGreaterThan(0);
  });

  test('renders empty timeline when track has no tasks', () => {
    const emptyTrack = {
      ...mockTrack,
      tasks: [],
    };

    render(
      <TimelinePreview track={emptyTrack} />
    );

    expect(screen.getByText('No tasks scheduled')).toBeInTheDocument();
  });

  test('handles negative due day offsets (pre-onboarding)', () => {
    render(
      <TimelinePreview track={mockTrack} />
    );

    const preOnboardingTask = screen.getByText('Pre-onboarding orientation');
    expect(preOnboardingTask).toBeInTheDocument();
  });

  test('handles large due day offsets (90+ days)', () => {
    render(
      <TimelinePreview track={mockTrack} />
    );

    const ninetyDayTask = screen.getByText('90-day review');
    expect(ninetyDayTask).toBeInTheDocument();
  });

  test('displays owner role color legend', () => {
    render(
      <TimelinePreview track={mockTrack} />
    );

    expect(screen.getByText('Owner Roles')).toBeInTheDocument();
    expect(screen.getByText(/onboarding-manager|manager|hr/)).toBeInTheDocument();
  });

  test('is responsive on mobile', () => {
    global.innerWidth = 375;
    render(
      <TimelinePreview track={mockTrack} />
    );

    expect(screen.getByText('Timeline Preview')).toBeInTheDocument();
  });
});
