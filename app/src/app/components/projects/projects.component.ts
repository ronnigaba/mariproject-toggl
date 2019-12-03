import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {MariProjectService} from '../../services/mari-project.service';
import {SettingsService} from '../../services/settings.service';
import {TogglService} from '../../services/toggl.service';

@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
    public projects: any = [];
    public contracts: any = [];
    public positions: any = [];
    public selectedProject: any;
    public selectedContract: any;
    public selectedPosition: any;

    constructor(private settingsService: SettingsService, private mariProjectService: MariProjectService, private snackBar: MatSnackBar, private togglService: TogglService, private router: Router) {
    }

    public async ngOnInit(): Promise<void> {
        if (!this.settingsService.isSettingsSet()) {
            await this.router.navigate(['setup']);
            return;
        }
        try {
            const response = await this.mariProjectService.getListProjectsForTimeBooking();
            this.projects = response.result.oGetListProjectsForTimeBookingResult.clsKeyPair.map((x: any) => {
                return ({
                    sKeyInternal: x.sKeyInternal,
                    sMatchcode: x.sMatchcode
                });
            });
        } catch (e) {
            console.log(e);
            this.snackBar.open('Error loading projects: ' + e.status, 'Close', {
                duration: 20000,
            });
        }
    }

    public async onProjectChanged(): Promise<void> {
        try {
            this.contracts = [];
            this.positions = [];
            const response = await this.mariProjectService.getListContractToProject(this.selectedProject);
            this.contracts = response.result.oGetListContractToProjectResult.clsKeyPair.map((x: any) => {
                return ({
                    sKeyInternal: x.sKeyInternal,
                    sMatchcode: x.sMatchcode
                });
            });
        } catch (e) {
            console.log(e);
            this.snackBar.open('Error loading contracts: ' + e.status, 'Close', {
                duration: 20000,
            });
        }
    }

    public async onContractChanged(): Promise<void> {
        try {
            this.positions = [];
            const response = await this.mariProjectService.getListPositionsOfContractForPlanning(this.selectedContract);
            this.positions = response.result.oGetListPositionsOfContractForPlanningResult.clsKeyPair.map((x: any) => {
                return ({
                    sKeyInternal: x.sKeyInternal,
                    sMatchcode: x.sMatchcode
                });
            });
        } catch (e) {
            console.log(e);
            this.snackBar.open('Error loading positions: ' + e.status, 'Close', {
                duration: 20000,
            });
        }
    }

    public async createProjectInToggl(): Promise<void> {
        if (!this.selectedPosition || !this.selectedProject || !this.selectedContract) {
            this.snackBar.open('Please select all fields', 'Close', {
                duration: 5000,
            });
            return;
        }
        try {
            const match = this.positions.find((x: any) => x.sKeyInternal === this.selectedPosition);
            const name = match.sMatchcode + ' [' + this.selectedProject + '|' + this.selectedContract + '|' + this.selectedPosition + ']';
            await this.togglService.createProject({
                project:
                    {
                        name: name
                    }
            });
            this.snackBar.open('Project was created in Toggl', 'Close', {
                duration: 5000,
            });
        } catch (e) {
            if (e.error && e.error.includes('has already been taken')) {
                this.snackBar.open('Project already exist', 'Close', {
                    duration: 5000,
                });
            } else {
                console.log(e);
                this.snackBar.open('Could not create project: ' + JSON.stringify(e), 'Close', {
                    duration: 15000,
                });
            }
        }
    }
}
