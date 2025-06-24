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
    name: 'Antony Palacios',
    roles: [
        {id: 1, role: 'Administrador', current: true},
        {id: 2, role: 'Tutor', current: false},
    ]
}

export const fakeStudents = [
    {
        id: 1,
        name: 'Antony Palacios',
        area: 'Ciencias',
        email: 'AntonyPalacios@gmail.com',
        tutor: 'Silvia Valle',
        active: true
    },
    {
        id: 2,
        name: 'Antony Palacios',
        area: 'Letras',
        email: 'AntonyPalacios@gmail.com',
        tutor: 'Silvia Valle',
        active: false
    },
    {
        id: 3,
        name: 'Antony Palacios',
        area: 'Arquitectura',
        email: 'AntonyPalacios@gmail.com',
        tutor: 'Silvia Valle',
        active: true
    },
    {
        id: 4,
        name: 'Antony Palacios',
        area: 'Arquitectura',
        email: 'AntonyPalacios@gmail.com',
        tutor: 'Silvia Valle',
        active: true
    },
    {
        id: 5,
        name: 'Antony Palacios',
        area: 'Arquitectura',
        email: 'AntonyPalacios@gmail.com',
        tutor: 'Silvia Valle',
        active: true
    },
]

export const etapas = [
    {id:1,etapa:'Regular 1'},
    {id:2,etapa:'Regular 2'},
    {id:3,etapa:'Regular 3'},
    {id:4,etapa:'Repaso'},
]

export const areas = [
    {id:1,area:'Ciencias'},
    {id:2,area:'Letras'},
    {id:3,area:'Arquitectura'},
]

export const tutores = [
    {id:1,name:'Silvia Valle'},
    {id:1,name:'Ximena'},
    {id:1,name:'Ana'},
]