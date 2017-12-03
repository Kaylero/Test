
(function() {

    var parameters = PluginManager.parameters('Steal');
    var stealMode = Number(parameters['Steal Mode'] || 1);
    var stealSuccessText = String(parameters['Steal Success Text'] || "%1 stole %2 from %3!");
    var stealSkillSuccessText = String(parameters['Skill Success Text'] || "%1 stole skill %2 from %3!");
    var stealFailText = String(parameters['Steal Fail Text'] || "%1 failed to steal from %2.");
    var nothingLeftText = String(parameters['Nothing Left Text'] || "%1 doesn't have anything left!");
    var succeed = false;
    var itemGiven = [];

    var _Game_Enemy_setup = Game_Enemy.prototype.setup;

    Game_Enemy.prototype.setup = function(enemyId, x, y) {
        _Game_Enemy_setup.call(this, enemyId, x, y);

        this.items = [];
        this.armors = [];
        this.weapons = [];
        var data = this.enemy().meta.items.split(",");
        var items = [];
        var armors = [];
        var weapons = [];

        data.forEach(function (element) {
            var list = element.toString().split("_");
            switch (list[0]) {
                case "i":
                    items.push(list.slice(1,3));
                    break;
                case "a":
                    armors.push(list.slice(1,3));
                    break;
                case"w":
                    weapons.push(list.slice(1,3));
                    break;
            }
        });

        this.items = items;
        this.armors = armors;
        this.weapons = weapons;
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
        }
    };

    Game_System.prototype.steal = function(target) {
        var rand = Math.floor((Math.random() * 100) + 1);
        var itemPercent = [false, 0, 90];
        var armorPercent =[false, 50, 75];
        var weaponPercent = [false, 75, 90];
        var itemsLeft = false;
        succeed = false;
        itemGiven = [];

        if (target.items.length > 0) {
            itemPercent[0] = true;
            armorPercent[1] += 15;
            armorPercent[2] += 15;
            itemsLeft = true;
        }

        if (target.armors.length > 0) {
            armorPercent[0] = true;
            itemPercent[2] -= 25;
            itemsLeft = true;

        }

        if (target.weapons.length > 0) {
            weaponPercent[0] = true;
            itemPercent[2] -= 15;
            armorPercent[1] -= 15;
            armorPercent[2] -= 15;
            itemsLeft = true;

        }
        if (!itemsLeft) {
            return;
        }

        for (var i = 0; i < target.items.length - 1; i++) {

            if (itemPercent[0] && rand >= itemPercent[1] && rand < itemPercent[2]) {
                itemGiven = ["i"];
                itemGiven.push(target.items.pop());
                $gameParty.gainItem($dataItems[Number(itemGiven[0])], Number(itemGiven[1]));

            } else if (armorPercent[0] && rand >= armorPercent[1] && rand < armorPercent[2]) {
                itemGiven = ["a"];
                itemGiven.push(target.armors.pop());
                $gameParty.gainItem($dataArmors[Number(itemGiven[0])], Number(itemGiven[1]));

            } else if (weaponPercent[0] && rand >= weaponPercent[1] && rand < weaponPercent[2]) {
                itemGiven = ["w"];
                itemGiven.push(target.weapons.pop());
                $gameParty.gainItem($dataWeapons[Number(itemGiven[0])], Number(itemGiven[1]));

            } else {
                succeed = false;
            }

        }
        console.log(itemGiven);
    };

    var _Window_BattleLog_displayActionResults = Window_BattleLog.prototype.displayActionResults;
    Window_BattleLog.prototype.displayActionResults = function(subject, target) {
        _Window_BattleLog_displayActionResults.call(this, subject, target);
        if (itemGiven.length > 0) {
            this.push('addText', itemGiven[0]);
            itemGiven = [];
        }

    };


})();
