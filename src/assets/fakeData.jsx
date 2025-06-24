import {Group, CalendarToday, Person, Quiz, Checklist, Chat, Article} from '@mui/icons-material';


export const menuItems = [
    {
        id: 1,
        label: 'Ciclos',
        path: '/cycles',
        icon: <CalendarToday/>,
    },
    {
        id: 2,
        label: 'Alumnos',
        path: '/students',
        icon: <Person/>,
    },
    {
        id: 3,
        label: 'Usuarios',
        path: '/users',
        icon: <Group/>,
    },
    {
        id: 4,
        label: 'Exámenes',
        path: '/exams',
        icon: <Quiz/>,
    },
    {
        id: 5,
        label: 'Asistencia',
        path: '/attendance',
        icon: <Checklist/>,
    },
    {
        id: 6,
        label: 'Conversaciones',
        path: '/talks',
        icon: <Chat/>,
    },
    {
        id: 7,
        label: 'Reportes',
        path: '/reports',
        icon: <Article/>,
    }
];

export const fakeUser = {
    name: 'Silvia Valle',
    roles: [
        {id: 1, role: 'Administrador', current: true},
        {id: 2, role: 'Tutor', current: false},
    ]
}