import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card as AntCard, Tabs, Button as AntButton, message, Spin, Divider, Alert as AntAlert, Tooltip } from 'antd';
import { FilePdfOutlined, FileExcelOutlined, PrinterOutlined, WarningOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import AuditFindings from '../components/audit/AuditFindings';
import PrivilegedAccessTable from '../components/audit/PrivilegedAccessTable';
import SoDConflictsTable from '../components/audit/SoDConflictsTable';
import InactiveUsersTable from '../components/audit/InactiveUsersTable';
import GhostUsersTable from '../components/audit/GhostUsersTable';
import UsersWithoutRolesTable from '../components/audit/UsersWithoutRolesTable';
import { generateReport } from '../services/AnalysisService';
import { 
  getButtonClass, 
  getCardClass, 
  getSectionTitleClass, 
  getAlertClass, 
  getSectionContainerClass,
  getDividerClass,
  getStatClass,
  getStatLabelClass
} from '../utils/StyleUtils';

const { TabPane } = Tabs;

/**
 * Page for displaying the comprehensive audit report with findings
 */
const AuditReportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('findings');
  
  useEffect(() => {
    // Get analysis data from location state or redirect to analysis page
    if (location.state && location.state.analysisData) {
      setAnalysisData(location.state.analysisData);
    } else if (localStorage.getItem('lastAnalysisData')) {
      try {
        const savedData = JSON.parse(localStorage.getItem('lastAnalysisData'));
        setAnalysisData(savedData);
      } catch (e) {
        message.error('Erreur lors de la récupération des données d\'analyse');
        navigate('/analysis');
      }
    } else {
      message.warning('Veuillez d\'abord effectuer une analyse');
      navigate('/analysis');
    }
  }, [location, navigate]);

  // Helper function to export data to CSV
  const exportToCsv = (data, filename) => {
    if (!data || data.length === 0) {
      message.error("Aucune donnée à exporter");
      return;
    }
    
    let csvContent = '';
    
    // Headers
    const headers = Object.keys(data[0]);
    csvContent += headers.join(',') + '\n';
    
    // Data
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        } else if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else {
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }
      });
      csvContent += row.join(',') + '\n';
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate PDF report
  const generatePdfReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!analysisData || !analysisData.analysis_id) {
        throw new Error('Données d\'analyse non disponibles');
      }
      
      const report = await generateReport(analysisData.analysis_id, 'pdf');
      
      // Open/download the PDF
      if (report && report.reportUrl) {
        window.open(report.reportUrl, '_blank');
      } else {
        throw new Error('Erreur lors de la génération du rapport PDF');
      }
    } catch (err) {
      setError(err.message);
      message.error(err.message || 'Erreur lors de la génération du rapport');
    } finally {
      setLoading(false);
    }
  };

  // Print the report
  const printReport = () => {
    window.print();
  };

  // Calculate overall risk score
  const calculateRiskScore = () => {
    if (!analysisData || !analysisData.results || !analysisData.results.auditFindings) {
      return { score: 0, level: 'Inconnu' };
    }
    
    const findings = analysisData.results.auditFindings;
    
    // Weight based on risk rating
    const weights = { 'Critical': 10, 'High': 5, 'Medium': 2, 'Low': 1 };
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    findings.forEach(finding => {
      const weight = weights[finding.riskRating] || 0;
      totalWeight += weight;
      weightedSum += weight;
    });
    
    // Calculate score (0-100)
    const score = Math.min(Math.round((weightedSum / (totalWeight * 0.3)) * 10), 100);
    
    // Determine risk level
    let level = 'Faible';
    if (score >= 75) level = 'Critique';
    else if (score >= 50) level = 'Élevé';
    else if (score >= 25) level = 'Moyen';
    
    return { score, level };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={getAlertClass('danger')}>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Erreur</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisData || !analysisData.results) {
    return (
      <div className={getAlertClass('warning')}>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">Données manquantes</h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>Aucune donnée d'analyse disponible. Veuillez effectuer une analyse.</p>
          </div>
        </div>
      </div>
    );
  }

  const { results } = analysisData;
  const { auditFindings, crossAnalysis, userLoginActivity } = results;
  const riskScore = calculateRiskScore();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className={getSectionTitleClass('xl')}>Rapport d'Audit SAP</h1>
          <p className="text-gray-500">Généré le {new Date().toLocaleDateString()} | ID: {analysisData.analysis_id}</p>
        </div>
        <div className="flex space-x-2">
          <Tooltip title="Générer un PDF">
            <AntButton
              icon={<FilePdfOutlined />}
              className={getButtonClass('outline')}
              onClick={generatePdfReport}
            >
              PDF
            </AntButton>
          </Tooltip>
          <Tooltip title="Exporter en Excel">
            <AntButton
              icon={<FileExcelOutlined />}
              className={getButtonClass('outline')}
              onClick={() => message.info('Fonctionnalité à venir')}
            >
              Excel
            </AntButton>
          </Tooltip>
          <Tooltip title="Imprimer">
            <AntButton
              icon={<PrinterOutlined />}
              className={getButtonClass('outline')}
              onClick={printReport}
            >
              Imprimer
            </AntButton>
          </Tooltip>
        </div>
      </div>

      {/* Executive Summary */}
      <div className={`${getCardClass('default')} ${getSectionContainerClass()}`}>
        <h2 className={getSectionTitleClass('lg')}>Résumé Exécutif</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-md ${riskScore.level === 'Critique' ? 'bg-red-50 border border-red-200' : 
            riskScore.level === 'Élevé' ? 'bg-orange-50 border border-orange-200' : 
            riskScore.level === 'Moyen' ? 'bg-yellow-50 border border-yellow-200' : 
            'bg-green-50 border border-green-200'}`}>
            <div className="flex flex-col items-center">
              <div className={getStatLabelClass()}>Score de Risque Global</div>
              <div className={getStatClass(
                riskScore.level === 'Critique' ? 'negative' : 
                riskScore.level === 'Élevé' ? 'warning' : 
                riskScore.level === 'Moyen' ? 'warning' : 
                'positive'
              )}>
                {riskScore.score}/100
              </div>
              <div className={`mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                riskScore.level === 'Critique' ? 'bg-red-100 text-red-800' : 
                riskScore.level === 'Élevé' ? 'bg-orange-100 text-orange-800' : 
                riskScore.level === 'Moyen' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {riskScore.level.toUpperCase()}
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <WarningOutlined className="text-red-500 mr-2 text-xl" />
              <div>
                <div className={getStatLabelClass()}>Problèmes Critiques</div>
                <div className={getStatClass('negative')}>
                  {auditFindings.filter(f => f.riskRating === 'Critical').length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-center">
              <WarningOutlined className="text-orange-500 mr-2 text-xl" />
              <div>
                <div className={getStatLabelClass()}>Problèmes Élevés</div>
                <div className={getStatClass('warning')}>
                  {auditFindings.filter(f => f.riskRating === 'High').length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <SafetyOutlined className="text-blue-500 mr-2 text-xl" />
              <div>
                <div className={getStatLabelClass()}>Conformité</div>
                <div className={getStatClass('highlight')}>
                  {Math.round(100 - (auditFindings.length / 7 * 100))}%
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={getDividerClass('default')}></div>
        
        <div className="space-y-3">
          <h3 className={getSectionTitleClass('md')}>Principales Conclusions</h3>
          <p>
            L'audit de sécurité SAP a identifié {auditFindings.length} problèmes nécessitant une attention.
            {auditFindings.filter(f => f.riskRating === 'Critical').length > 0 && 
              ` Il y a ${auditFindings.filter(f => f.riskRating === 'Critical').length} problèmes critiques qui doivent être corrigés immédiatement.`}
          </p>
          
          <div className="space-y-2 mt-2">
            {auditFindings.slice(0, 3).map((finding, index) => (
              <div key={index} className="flex items-start">
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                  finding.riskRating === 'Critical' ? 'bg-red-100' : 
                  finding.riskRating === 'High' ? 'bg-orange-100' : 
                  finding.riskRating === 'Medium' ? 'bg-yellow-100' : 
                  'bg-green-100'
                }`}>
                  <span className={`text-xs font-bold ${
                    finding.riskRating === 'Critical' ? 'text-red-700' : 
                    finding.riskRating === 'High' ? 'text-orange-700' : 
                    finding.riskRating === 'Medium' ? 'text-yellow-700' : 
                    'text-green-700'
                  }`}>{index + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{finding.title}</p>
                  <p className="text-xs text-gray-500">{finding.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className={getSectionContainerClass()}
        type="card"
      >
        <TabPane tab="Problèmes d'Audit" key="findings">
          <div className={getCardClass('default')}>
            <AuditFindings findings={auditFindings} />
          </div>
        </TabPane>
        
        <TabPane tab="Accès Privilégiés" key="privileged">
          <div className={getCardClass('default')}>
            <PrivilegedAccessTable 
              privilegedAccess={crossAnalysis.privilegedAccessIssues} 
              onExport={exportToCsv}
            />
          </div>
        </TabPane>
        
        <TabPane tab="Séparation des Tâches" key="sod">
          <div className={getCardClass('default')}>
            <SoDConflictsTable 
              conflictsData={crossAnalysis.segregationOfDutiesIssues} 
              onExport={exportToCsv} 
            />
          </div>
        </TabPane>
        
        <TabPane tab="Utilisateurs Inactifs" key="inactive">
          <div className={getCardClass('default')}>
            <InactiveUsersTable 
              inactiveUsers={crossAnalysis.inactiveActiveUsers} 
              onExport={exportToCsv}
            />
          </div>
        </TabPane>
        
        <TabPane tab="Utilisateurs Fantômes" key="ghost">
          <div className={getCardClass('default')}>
            <GhostUsersTable 
              ghostUsers={crossAnalysis.ghostUsers} 
              onExport={exportToCsv}
            />
          </div>
        </TabPane>
        
        <TabPane tab="Utilisateurs Sans Rôles" key="noroles">
          <div className={getCardClass('default')}>
            <UsersWithoutRolesTable 
              usersWithoutRoles={crossAnalysis.usersWithoutRoles} 
              onExport={exportToCsv}
            />
          </div>
        </TabPane>
      </Tabs>

      {/* Conclusion */}
      <div className={getCardClass('default')}>
        <h2 className={getSectionTitleClass('lg')}>Conclusion et Prochaines Étapes</h2>
        
        <div className="space-y-4">
          <p>
            Cette analyse a identifié plusieurs domaines qui nécessitent une attention pour améliorer
            la sécurité et la conformité de votre système SAP. Voici les prochaines étapes recommandées:
          </p>
          
          <div className="space-y-2">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-red-100 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-red-700">1</span>
              </div>
              <p>
                <span className="font-medium">Corriger les problèmes critiques:</span>{' '}
                Concentrez-vous d'abord sur les problèmes classés comme "Critique", en particulier 
                {auditFindings.filter(f => f.riskRating === 'Critical').length > 0 
                  ? ` ${auditFindings.filter(f => f.riskRating === 'Critical')[0].title.toLowerCase()}`
                  : ' les accès privilégiés excessifs'}.
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-orange-100 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-orange-700">2</span>
              </div>
              <p>
                <span className="font-medium">Résoudre les conflits de séparation des tâches:</span>{' '}
                Réassignez les rôles conflictuels à différents utilisateurs pour améliorer les contrôles internes.
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-yellow-100 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-yellow-700">3</span>
              </div>
              <p>
                <span className="font-medium">Nettoyer les utilisateurs inactifs:</span>{' '}
                Désactivez ou supprimez les comptes d'utilisateurs inactifs pour réduire la surface d'attaque.
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-blue-700">4</span>
              </div>
              <p>
                <span className="font-medium">Établir un processus périodique:</span>{' '}
                Mettez en place une revue périodique des accès utilisateurs pour maintenir un niveau de sécurité élevé.
              </p>
            </div>
          </div>
          
          <div className={getDividerClass('yellow')}></div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex items-center mb-2">
              <CheckCircleOutlined className="text-green-500 mr-2" />
              <h3 className={getSectionTitleClass('md')}>Plan d'action recommandé</h3>
            </div>
            <ol className="list-decimal pl-8 space-y-2">
              <li>Établir une équipe de correction avec des responsables pour chaque domaine à risque</li>
              <li>Définir un calendrier de résolution avec priorité aux problèmes critiques</li>
              <li>Implémenter un processus de revue périodique des accès (trimestriel)</li>
              <li>Documenter les exceptions requises par l'entreprise avec des approbations formelles</li>
              <li>Effectuer une nouvelle analyse dans 90 jours pour vérifier les améliorations</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditReportPage; 