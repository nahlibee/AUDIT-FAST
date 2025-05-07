import Api from './Api';

class MissionAssignmentService {
    static async getAssignmentsByMission(missionId) {
        return Api.get(`/api/mission-assignments/mission/${missionId}`);
    }

    static async getAssignmentsByAuditor(auditorUsername) {
        return Api.get(`/api/mission-assignments/auditor/${auditorUsername}`);
    }

    static async getAssignmentById(id) {
        return Api.get(`/api/mission-assignments/${id}`);
    }

    static async assignAuditor(assignmentData) {
        return Api.post('/api/mission-assignments', assignmentData);
    }

    static async updateAssignment(id, assignmentData) {
        return Api.put(`/api/mission-assignments/${id}`, assignmentData);
    }

    static async removeAssignment(id) {
        return Api.delete(`/api/mission-assignments/${id}`);
    }

    static async getAssignmentsByRole(role) {
        return Api.get(`/api/mission-assignments/role/${role}`);
    }

    static async getAssignmentsByStatus(status) {
        return Api.get(`/api/mission-assignments/status/${status}`);
    }

    static async getAssignmentsByMissionAndRole(missionId, role) {
        return Api.get(`/api/mission-assignments/mission/${missionId}/role/${role}`);
    }
}

export default MissionAssignmentService; 