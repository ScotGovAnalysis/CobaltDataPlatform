import React, { useState } from 'react';
import styles from '../../styles/Embedded_Modal.module.css'; // Keep your existing CSS module path
import config from '../../config.js'

const ApiModal = ({ resourceId, isOpen, onClose }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('curl');
  const [expandedSections, setExpandedSections] = useState({
    querying: true,
    browser: false
  });

  const apiToken = config.apiToken;
  const baseUrl = config.apiBaseUrl;

  if (!isOpen) return null;

  const languages = [
    { id: 'curl', label: 'curl' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'powershell', label: 'PowerShell' },
    { id: 'python', label: 'Python' },
    { id: 'r', label: 'R' }
  ];

  const examples = {
    search: {
      curl: `curl ${baseUrl}/api/action/datastore_search \\
  -H"Authorization:${apiToken}" -d '
{
  "resource_id": "${resourceId}",
  "limit": 5,
  "q": "jones"
}'`,
      javascript: `const resp = await fetch(\`${baseUrl}/api/action/datastore_search\`, {
    method: 'POST',
    headers: {
        'content-type': 'application/json',
        authorization: API_TOKEN
    },
    body: JSON.stringify({
        resource_id: '${resourceId}',
        limit: 5,
        q: 'jones'
    })
})
await resp.json()`,
      powershell: `$json = @'
{
  "resource_id": "${resourceId}",
  "limit": 5,
  "q": "jones"
}
'@
$response = Invoke-RestMethod ${baseUrl}/api/action/datastore_search\`
  -Method Post -Body $json -Headers @{"Authorization"="$API_TOKEN"}
$response.result.records`,
      python: `from ckanapi import RemoteCKAN

rc = RemoteCKAN('${baseUrl}/', apikey=API_TOKEN)
result = rc.action.datastore_search(
    resource_id="${resourceId}",
    limit=5,
    q="jones",
)
print(result['records'])`,
      r: `library(httr2)

req <- request("${baseUrl}/api/action/datastore_search")
result <- req %>% 
    req_headers(Authorization = API_TOKEN) %>% 
    req_body_json(list(
        resource_id = '${resourceId}',
        limit = 5,
        q = 'jones'))
    req_perform %>% 
    resp_body_json`
    },
    filter: {
      curl: `curl ${baseUrl}/api/action/datastore_search \\
-H"Authorization:${apiToken}" -d '
{
"resource_id": "${resourceId}",
  "filters": {
    "subject": ["watershed", "survey"],
    "stage": "active"
  }
}'`,
      javascript: `const resp = await fetch(\`${baseUrl}/api/action/datastore_search\`, {
    method: 'POST',
    headers: {
        'content-type': 'application/json',
        authorization: API_TOKEN
    },
    body: JSON.stringify({resource_id: '${resourceId}', filters: {
        subject: ['watershed', 'survey'],
        stage: 'active'
    }})})
await resp.json()`,
      powershell: `$json = @'
{
  "resource_id": "${resourceId}",
  "filters": {
    "subject": ["watershed", "survey"],
    "stage": "active"
  }
}
'@
$response = Invoke-RestMethod ${baseUrl}/api/action/datastore_search\`
  -Method Post -Body $json -Headers @{"Authorization"="$API_TOKEN"}
$response.result.records`,
      python: `from ckanapi import RemoteCKAN

rc = RemoteCKAN('${baseUrl}/', apikey=API_TOKEN)
result = rc.action.datastore_search(
    resource_id="${resourceId}",
    filters={
      "subject": ["watershed", "survey"],
      "stage": "active",
    },
)
print(result['records'])`,
      r: `library(httr2)

req <- request("${baseUrl}/api/action/datastore_search")
result <- req %>% 
    req_headers(Authorization = API_TOKEN) %>% 
    req_body_json(list(
        resource_id='${resourceId}', 
        filters = list(
            subject = list("watershed", "survey"), 
            stage = "active")))
    req_perform %>% 
    resp_body_json`
    }
  };

  // Function to copy code to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };



  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.titleContainer}>
            <span className={styles.apiTitle}>CKAN Data API</span>
            <span className={styles.apiVersion}>v1.0</span>
          </div>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <p className={styles.apiDescription}>
            <strong>Access resource data via a web API with powerful query support</strong>.
            Further information in the <a href="https://docs.ckan.org/en/latest/maintaining/datastore.html#api-reference" target="_blank" rel="noreferrer">main CKAN Data API and DataStore documentation</a>.
          </p>

          <div className={styles.languageSelector}>
            <p className={styles.codeExamplesLabel}>Code examples:</p>
            <div className={styles.languageButtons}>
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  className={`${styles.languageButton} ${selectedLanguage === lang.id ? styles.active : ''}`}
                  onClick={() => setSelectedLanguage(lang.id)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.apiExamplesContainer}>
            {/* Querying section */}
            <div className={styles.apiSection}>
              <button 
                className={`${styles.sectionToggle} ${expandedSections.querying ? styles.expanded : ''}`}
                onClick={() => toggleSection('querying')}
              >
                Querying
                <svg 
                  className={styles.chevron} 
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              
              {expandedSections.querying && (
                <div className={styles.sectionContent}>
                  <div className={styles.exampleBlock}>
                    <div className={styles.exampleHeader}>
                      <strong>Get 5 results containing "jones" in any field:</strong>
                      <button 
                        className={styles.copyButton} 
                        onClick={() => copyToClipboard(examples.search[selectedLanguage])}
                        aria-label="Copy code to clipboard"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.33 6h-6.66c-.73 0-1.33.6-1.33 1.33v6.66c0 .74.6 1.34 1.33 1.34h6.66c.74 0 1.34-.6 1.34-1.34V7.33c0-.73-.6-1.33-1.34-1.33z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3.33 10H2.67A1.33 1.33 0 0 1 1.33 8.67V2A1.33 1.33 0 0 1 2.67.67h6.66A1.33 1.33 0 0 1 10.67 2v.67" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    <pre className={styles.codeBlock}>
                      <code>{examples.search[selectedLanguage]}</code>
                    </pre>
                  </div>

                  <div className={styles.exampleBlock}>
                    <div className={styles.exampleHeader}>
                      <strong>Get results with either "watershed" or "survey" as subject and "active" as its stage:</strong>
                      <button 
                        className={styles.copyButton} 
                        onClick={() => copyToClipboard(examples.filter[selectedLanguage])}
                        aria-label="Copy code to clipboard"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.33 6h-6.66c-.73 0-1.33.6-1.33 1.33v6.66c0 .74.6 1.34 1.33 1.34h6.66c.74 0 1.34-.6 1.34-1.34V7.33c0-.73-.6-1.33-1.34-1.33z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3.33 10H2.67A1.33 1.33 0 0 1 1.33 8.67V2A1.33 1.33 0 0 1 2.67.67h6.66A1.33 1.33 0 0 1 10.67 2v.67" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    <pre className={styles.codeBlock}>
                      <code>{examples.filter[selectedLanguage]}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Browser section */}
            <div className={styles.apiSection}>
              <button 
                className={`${styles.sectionToggle} ${expandedSections.browser ? styles.expanded : ''}`}
                onClick={() => toggleSection('browser')}
              >
                Using the API with this Web Browser
                <svg 
                  className={styles.chevron} 
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              
              {expandedSections.browser && (
                <div className={styles.sectionContent}>
                  <p>Some API endpoints may be accessed using a GET query string.</p>
                  
                  <div className={styles.exampleBlock}>
                    <strong>Query example (first 5 results)</strong>
                    <div className={styles.linkContainer}>
                      <a 
                        href={`${baseUrl}/api/action/datastore_search?resource_id=${resourceId}&limit=5`} 
                        target="_blank" 
                        rel="noreferrer"
                        className={styles.apiLink}
                      >
                        {`${baseUrl}/api/action/datastore_search?resource_id=${resourceId}&limit=5`}
                      </a>
                      <button 
                        className={styles.copyButton} 
                        onClick={() => copyToClipboard(`${baseUrl}/api/action/datastore_search?resource_id=${resourceId}&limit=5`)}
                        aria-label="Copy URL to clipboard"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.33 6h-6.66c-.73 0-1.33.6-1.33 1.33v6.66c0 .74.6 1.34 1.33 1.34h6.66c.74 0 1.34-.6 1.34-1.34V7.33c0-.73-.6-1.33-1.34-1.33z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3.33 10H2.67A1.33 1.33 0 0 1 1.33 8.67V2A1.33 1.33 0 0 1 2.67.67h6.66A1.33 1.33 0 0 1 10.67 2v.67" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className={styles.exampleBlock}>
                    <strong>Query example (results containing 'jones')</strong>
                    <div className={styles.linkContainer}>
                      <a 
                        href={`${baseUrl}/api/action/datastore_search?resource_id=${resourceId}&q=jones`} 
                        target="_blank" 
                        rel="noreferrer"
                        className={styles.apiLink}
                      >
                        {`${baseUrl}/api/action/datastore_search?resource_id=${resourceId}&q=jones`}
                      </a>
                      <button 
                        className={styles.copyButton} 
                        onClick={() => copyToClipboard(`${baseUrl}/api/action/datastore_search?resource_id=${resourceId}&q=jones`)}
                        aria-label="Copy URL to clipboard"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.33 6h-6.66c-.73 0-1.33.6-1.33 1.33v6.66c0 .74.6 1.34 1.33 1.34h6.66c.74 0 1.34-.6 1.34-1.34V7.33c0-.73-.6-1.33-1.34-1.33z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3.33 10H2.67A1.33 1.33 0 0 1 1.33 8.67V2A1.33 1.33 0 0 1 2.67.67h6.66A1.33 1.33 0 0 1 10.67 2v.67" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiModal;