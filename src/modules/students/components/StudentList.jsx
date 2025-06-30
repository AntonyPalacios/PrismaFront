import {StudentFilter} from "./StudentFilter.jsx";
import {StudentTable} from "./StudentTable.jsx";
import StudentFAB from "./StudentFAB.jsx";
import {useContext} from "react";
import {StudentContext} from "../../../context/StudentContext.jsx";
import {MyAlert} from "../../../components/ui/MyAlert.jsx";

export const StudentList = ({isLargeScreen}) => {
    const {state: {studentAlert}, onToggleAlert} = useContext(StudentContext);

    return (
        <>
            <StudentFilter isLargeScreen={isLargeScreen}/>
            <StudentTable />
            <StudentFAB />
            <MyAlert
                message={studentAlert.message}
                severity={studentAlert.severity}
                open={studentAlert.open}
                onHandleClose={onToggleAlert}
            />
        </>
    );
};
