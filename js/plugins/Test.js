
(function() {

    var parameters = PluginManager.parameters('Steal');
    var stealMode = Number(parameters['Steal Mode'] || 1);
    var stealSuccessText = String(parameters['Steal Success Text'] || "%1 stole %2 from %3!");
    var stealSkillSuccessText = String(parameters['Skill Success Text'] || "%1 stole skill %2 from %3!");
    var stealFailText = String(parameters['Steal Fail Text'] || "%1 failed to steal from %2.");
    var nothingLeftText = String(parameters['Nothing Left Text'] || "%1 doesn't have anything left!");
    var stealing = false;
    var itemGiven = [];

    var _Game_Enemy_setup = Game_Enemy.prototype.setup;

    Game_Enemy.prototype.setup = function(enemyId, x, y) {
        _Game_Enemy_setup.call(this, enemyId, x, y);

        this.items = [];
        var data = this.enemy().meta.items.split(",");
        var items = []

        data.forEach(function(element){
            items.push(element.split("_"));
        });
        this.items = items;
    };

    Game_Enemy.prototype.canBeStolen = function() {
        if  (!this.items) {
            return false;
        } else {
            var result = false;
            this.items.forEach(function(element) {
                if (Number(element[2]) > 0) {
                    result = true;
                }
            });
            return result;
        }
    };

    Game_Actor.prototype.canBeStolen = function() {
        return false;
    };

    var _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target);
        var result = target.result();
        if (result.isHit() && this.item().meta.steal) {
            $gameSystem.steal(target);
        } else {
        }
    };

    var _Game_Interpreter_pluginCommand =
        Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (command === 'Steal') {
            stealing = true;
        }
    };

    Game_System.prototype.steal = function(target) {
        var rand = Math.floor((Math.random() * 100) + 1);
        var itemPercent = [false, 0, 90];
        var armorPercent =[false, 50, 75];
        var weaponPercent = [false, 75, 90];
        var items = [];
        var weapons = [];
        var armors = [];
        var succeed = false;
        var firstTime = true;
        itemGiven = [];

        console.log(target.items);

        target.items.forEach(function(element){
            switch(element[0]){
                case "i":
                    if (!itemPercent[0]) {
                        itemPercent[0] = true;
                        armorPercent[1] += 15;
                        armorPercent[2] += 15;
                    }
                    items.push([element[1],element[2]]);
                    break;

                case "a":
                    if (!armorPercent [0]) {
                        armorPercent[0] = true;

                        itemPercent[2] -= 25;
                    }
                    armors.push([element[1],element[2]]);
                    break;

                case "w":
                    if (!weaponPercent[0]) {
                        weaponPercent[0] = true;
                        itemPercent[2] -= 15;
                        armorPercent[1] -= 15;
                        armorPercent[2] -= 15;
                    }
                    weapons.push([element[1],element[2]]);
                    break;
            }
        });

        for (var i = 0; i < target.items.length - 1; i++) {

            if (itemPercent[0] && rand >= itemPercent[1] && rand < itemPercent[2]) {
                if (items.length > 0) {
                    itemGiven = items.pop();
                    $gameParty.gainItem($dataItems[Number(itemGiven[0])], Number(itemGiven[1]));
                } else {
                    succeed = false;
                }

            } else if (armorPercent[0] && rand >= armorPercent[1] && rand < armorPercent[2]) {
                if (armors.length > 0) {
                    itemGiven = armors.pop();
                    $gameParty.gainItem($dataArmors[Number(itemGiven[0])], Number(itemGiven[1]));
                } else {
                    succeed = false;
                }

            } else if (weaponPercent[0] && rand >= weaponPercent[1] && rand < weaponPercent[2]) {
                if (weapons.length > 0) {
                    itemGiven = weapons.pop();
                    $gameParty.gainItem($dataWeapons[Number(itemGiven[0])], Number(itemGiven[1]));
                } else {
                    succeed = false;
                }
            } else {
                succeed = false;
            }

        }
    };

    var _Window_BattleLog_displayActionResults = Window_BattleLog.prototype.displayActionResults;
    Window_BattleLog.prototype.displayActionResults = function(subject, target) {
        _Window_BattleLog_displayActionResults.call(this, subject, target);
        if (itemGiven.length > 0) {
            this.push('addText', itemGiven[0])
            itemGiven = [];
        }

    };


})();
