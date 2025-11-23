#!/usr/bin/env python3
"""
Comprehensive State Verification Script
Checks actual file existence and completion status
Outputs: verification report for UNFINISHED_TASKS.md update
"""

import os
import json
from pathlib import Path
from collections import defaultdict

BASE = Path("/home/user/InTheWake")

class StateVerifier:
    def __init__(self):
        self.results = {
            'files_created_this_thread': [],
            'completed_tasks': [],
            'still_needed': [],
            'verification_details': {}
        }

    def verify_new_files(self):
        """Check files created during this thread"""
        new_files = [
            'comprehensive_site_audit.py',
            'admin/COMPREHENSIVE_AUDIT_2025_11_19.json',
            'admin/COMPREHENSIVE_SITE_AUDIT_2025_11_19.md',
            'assets/js/venue-boot.js',
            'ships/carnival-cruise-line/index.html',
            'ships/celebrity-cruises/index.html',
            'ships/holland-america-line/index.html',
        ]

        for file in new_files:
            path = BASE / file
            exists = path.exists()
            self.results['files_created_this_thread'].append({
                'file': file,
                'exists': exists,
                'size': path.stat().st_size if exists else 0
            })

    def verify_logbooks(self):
        """Verify all logbook files"""
        logbook_dir = BASE / "assets/data/logbook/rcl"

        if not logbook_dir.exists():
            self.results['verification_details']['logbooks'] = {
                'status': 'DIRECTORY_NOT_FOUND',
                'count': 0
            }
            return

        logbooks = list(logbook_dir.glob("*.json"))
        ship_slugs = [f.stem for f in logbooks]

        self.results['verification_details']['logbooks'] = {
            'status': 'VERIFIED',
            'count': len(logbooks),
            'ships': sorted(ship_slugs)
        }

    def verify_index_files(self):
        """Verify cruise line index files"""
        index_files = [
            'ships/carnival-cruise-line/index.html',
            'ships/celebrity-cruises/index.html',
            'ships/holland-america-line/index.html'
        ]

        results = {}
        for file in index_files:
            path = BASE / file
            results[file] = path.exists()

        self.results['verification_details']['index_files'] = results

    def verify_search_and_sitemap(self):
        """Verify search.html and sitemap.xml"""
        files = {
            'search.html': BASE / 'search.html',
            'sitemap.xml': BASE / 'sitemap.xml'
        }

        results = {}
        for name, path in files.items():
            results[name] = {
                'exists': path.exists(),
                'size': path.stat().st_size if path.exists() else 0
            }

        self.results['verification_details']['seo_files'] = results

    def verify_json_files(self):
        """Verify JSON files we fixed"""
        json_files = [
            'assets/data/rc_bars_by_class.json',
            'assets/data/rc_ships_meta.json',
            'assets/data/logbook/rcl/spectrum-of-the-seas.json',
            'assets/data/search-index.json'
        ]

        results = {}
        for file in json_files:
            path = BASE / file
            if not path.exists():
                results[file] = {'valid': False, 'error': 'NOT_FOUND'}
                continue

            try:
                with open(path, 'r') as f:
                    json.load(f)
                results[file] = {'valid': True, 'error': None}
            except json.JSONDecodeError as e:
                results[file] = {'valid': False, 'error': str(e)}

        self.results['verification_details']['json_files'] = results

    def verify_orphan_cleanup(self):
        """Verify orphan files were deleted"""
        deleted_files = [
            '__pycache__',
            'vendor',
            'cruise-lines/disney.html.bak'
        ]

        results = {}
        for file in deleted_files:
            path = BASE / file
            results[file] = {
                'deleted': not path.exists(),
                'still_exists': path.exists()
            }

        self.results['verification_details']['orphan_cleanup'] = results

    def verify_venue_boot(self):
        """Verify venue-boot.js exists and is valid"""
        path = BASE / 'assets/js/venue-boot.js'

        if not path.exists():
            self.results['verification_details']['venue_boot'] = {
                'status': 'NOT_FOUND'
            }
            return

        with open(path, 'r') as f:
            content = f.read()

        self.results['verification_details']['venue_boot'] = {
            'status': 'EXISTS',
            'size': len(content),
            'has_init': 'initShipPills' in content,
            'has_load': 'loadVenueData' in content
        }

    def count_html_files(self):
        """Count total HTML files"""
        html_files = []
        for f in BASE.rglob("*.html"):
            if "vendors" not in str(f) and "node_modules" not in str(f):
                html_files.append(str(f.relative_to(BASE)))

        self.results['verification_details']['html_count'] = {
            'total': len(html_files),
            'sample': html_files[:10]
        }

    def verify_icp_lite_coverage(self):
        """Check ICP-Lite coverage"""
        html_files = list(BASE.rglob("*.html"))
        html_files = [f for f in html_files if "vendors" not in str(f) and "node_modules" not in str(f)]

        with_icp = 0
        for f in html_files:
            try:
                with open(f, 'r', encoding='utf-8', errors='ignore') as file:
                    content = file.read()
                    if 'content-protocol' in content and 'ICP-Lite' in content:
                        with_icp += 1
            except:
                pass

        self.results['verification_details']['icp_lite'] = {
            'total_html': len(html_files),
            'with_icp_lite': with_icp,
            'coverage_percent': round((with_icp / len(html_files)) * 100, 1) if html_files else 0
        }

    def verify_protocol_docs(self):
        """Check if protocol docs exist"""
        docs = [
            'standards/ITW-LITE_PROTOCOL_v3.010.lite.md',
            'STANDARDS_INDEX_33.md',
            'CLAUDE.md'
        ]

        results = {}
        for doc in docs:
            path = BASE / doc
            results[doc] = path.exists()

        self.results['verification_details']['protocol_docs'] = results

    def verify_articles(self):
        """Check article completion status"""
        articles = {
            'In the Wake of Grief': 'solo/in-the-wake-of-grief.html',
            'Accessible Cruising': 'solo/articles/accessible-cruising.html',
            'Solo Cruising': 'why-i-started-solo-cruising.html',
        }

        results = {}
        for title, path in articles.items():
            full_path = BASE / path
            results[title] = {
                'exists': full_path.exists(),
                'path': path
            }

        self.results['verification_details']['articles'] = results

    def run_all_checks(self):
        """Run all verification checks"""
        print("Starting comprehensive state verification...\n")

        self.verify_new_files()
        self.verify_logbooks()
        self.verify_index_files()
        self.verify_search_and_sitemap()
        self.verify_json_files()
        self.verify_orphan_cleanup()
        self.verify_venue_boot()
        self.count_html_files()
        self.verify_icp_lite_coverage()
        self.verify_protocol_docs()
        self.verify_articles()

        return self.results

    def generate_report(self):
        """Generate markdown report"""
        results = self.run_all_checks()

        report = []
        report.append("# VERIFICATION REPORT - Actual State Check")
        report.append(f"**Date:** 2025-11-19")
        report.append(f"**Thread:** claude/track-thread-status-01VdXW51MuvV3Vpa9UBrH2n9\n")

        report.append("## Files Created This Thread\n")
        for item in results['files_created_this_thread']:
            status = "✅ EXISTS" if item['exists'] else "❌ MISSING"
            size = f"({item['size']} bytes)" if item['exists'] else ""
            report.append(f"- {status} `{item['file']}` {size}")

        report.append("\n## Logbooks Verification\n")
        logbooks = results['verification_details']['logbooks']
        report.append(f"- Status: {logbooks['status']}")
        report.append(f"- Count: {logbooks['count']} ships")
        if logbooks['count'] > 0:
            report.append(f"- Ships: {', '.join(logbooks['ships'][:10])}...")

        report.append("\n## Index Files\n")
        for file, exists in results['verification_details']['index_files'].items():
            status = "✅" if exists else "❌"
            report.append(f"- {status} {file}")

        report.append("\n## SEO Files\n")
        for name, data in results['verification_details']['seo_files'].items():
            status = "✅" if data['exists'] else "❌"
            size = f"({data['size']} bytes)" if data['exists'] else ""
            report.append(f"- {status} {name} {size}")

        report.append("\n## JSON Files (Fixed)\n")
        for file, data in results['verification_details']['json_files'].items():
            status = "✅ VALID" if data['valid'] else f"❌ {data['error']}"
            report.append(f"- {status} {file}")

        report.append("\n## Orphan Cleanup\n")
        for file, data in results['verification_details']['orphan_cleanup'].items():
            status = "✅ DELETED" if data['deleted'] else "❌ STILL EXISTS"
            report.append(f"- {status} {file}")

        report.append("\n## Venue Boot JS\n")
        vb = results['verification_details']['venue_boot']
        report.append(f"- Status: {vb['status']}")
        if vb['status'] == 'EXISTS':
            report.append(f"- Size: {vb['size']} bytes")
            report.append(f"- Has initShipPills: {'✅' if vb['has_init'] else '❌'}")
            report.append(f"- Has loadVenueData: {'✅' if vb['has_load'] else '❌'}")

        report.append("\n## HTML Files Count\n")
        hc = results['verification_details']['html_count']
        report.append(f"- Total: {hc['total']} files")

        report.append("\n## ICP-Lite Coverage\n")
        icp = results['verification_details']['icp_lite']
        report.append(f"- Total HTML: {icp['total_html']}")
        report.append(f"- With ICP-Lite: {icp['with_icp_lite']}")
        report.append(f"- Coverage: {icp['coverage_percent']}%")

        report.append("\n## Protocol Docs\n")
        for doc, exists in results['verification_details']['protocol_docs'].items():
            status = "✅" if exists else "❌ MISSING"
            report.append(f"- {status} {doc}")

        report.append("\n## Articles\n")
        for title, data in results['verification_details']['articles'].items():
            status = "✅" if data['exists'] else "❌"
            report.append(f"- {status} {title} (`{data['path']}`)")

        return "\n".join(report)

if __name__ == "__main__":
    verifier = StateVerifier()
    report = verifier.generate_report()
    print(report)

    # Save JSON results
    results = verifier.results
    with open(BASE / 'admin/VERIFICATION_REPORT_2025_11_19.json', 'w') as f:
        json.dump(results, f, indent=2)

    print("\n\nJSON report saved to: admin/VERIFICATION_REPORT_2025_11_19.json")
