/**
 * Combat System
 * Handles combat instances, damage calculation, and combat state
 */

class CombatSystem {
  constructor(gameState, gameData) {
    this.gameState = gameState;
    this.gameData = gameData;
    this.activeCombat = null;
  }

  /**
   * Start a new combat encounter
   * @param {object} enemyTemplate - Enemy template from gameData.enemyArr
   * @returns {object} activeCombat instance
   */
  startCombat(enemyTemplate) {
    this.activeCombat = {
      enemy: this.createEnemyInstance(enemyTemplate),
      round: 1,
      turnOrder: ['player', 'enemy'], // Can expand for multiple enemies
      currentTurnIndex: 0,
      combatLog: [],
      isActive: true
    };

    this.addLog(`Combat started vs ${this.activeCombat.enemy.name}!`);
    return this.activeCombat;
  }

  /**
   * Create an active instance of an enemy from template
   * @param {object} template - Enemy template
   * @returns {object} Enemy instance with HP tracking
   */
  createEnemyInstance(template) {
    return {
      ...template,
      currentHP: template.maxHP,
      status: {
        poisoned: false,
        stunned: false
      },
      turnCounter: 0
    };
  }

  /**
   * Calculate damage with player weapon consideration
   * @param {string} damageSize - 'small', 'medium', 'large'
   * @param {number} baseDamage - Base damage value
   * @returns {number} Final damage amount
   */
  calculateDamage(baseDamage, damageSize = 'small') {
    const damageVariances = {
      small: [-1, 0, 1],
      medium: [-3, -2, 0, 2, 3],
      large: [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]
    };

    const variance = damageVariances[damageSize];
    const randomVariance = variance[Math.floor(Math.random() * variance.length)];
    let damage = baseDamage + randomVariance;

    // TODO: Add weapon bonus from player.weapon when you build inventory system
    // if (this.gameState.player.weapon) {
    //   damage += weaponBonusMap[this.gameState.player.weapon];
    // }

    return Math.max(1, damage); // Minimum 1 damage
  }

  /**
   * Player attacks the current enemy
   * @param {string} attackType - 'punch', 'ability', 'weapon' (for future use)
   * @returns {object} Attack result {damage, killed, log}
   */
  playerAttack(attackType = 'punch') {
    if (!this.activeCombat?.isActive) {
      return { error: 'No active combat' };
    }

    let damage;
    if (attackType === 'punch') {
      damage = this.calculateDamage(5, 'small');
    } else {
      damage = this.calculateDamage(8, 'medium'); // Default for other types
    }

    this.activeCombat.enemy.currentHP -= damage;
    const killed = this.activeCombat.enemy.currentHP <= 0;

    const log = `You deal ${damage} damage! ${this.activeCombat.enemy.name} HP: ${Math.max(0, this.activeCombat.enemy.currentHP)}`;
    this.addLog(log);

    if (killed) {
      this.endCombat('victory');
      return { damage, killed: true, log, victory: true };
    }

    return { damage, killed: false, log, victory: false };
  }

  /**
   * Enemy attacks the player (simple AI for now)
   * @returns {object} Attack result {damage, log}
   */
  enemyAttack() {
    if (!this.activeCombat?.isActive) {
      return { error: 'No active combat' };
    }

    const enemy = this.activeCombat.enemy;
    const damage = Math.max(1, enemy.attack - Math.floor(Math.random() * 5));
    this.gameState.player.health -= damage;

    const log = `${enemy.name} deals ${damage} damage! Your HP: ${Math.max(0, this.gameState.player.health)}`;
    this.addLog(log);

    if (this.gameState.player.health <= 0) {
      this.endCombat('defeat');
      return { damage, log, defeat: true };
    }

    return { damage, log, defeat: false };
  }

  /**
   * End combat and award loot
   * @param {string} result - 'victory' or 'defeat'
   */
  endCombat(result) {
    if (!this.activeCombat) return;

    if (result === 'victory') {
      this.addLog(`Victory! Defeated ${this.activeCombat.enemy.name}`);
      // TODO: Award XP and loot when inventory system ready
      // this.awardLoot(this.activeCombat.enemy);
    } else if (result === 'defeat') {
      this.addLog('You have been defeated!');
    }

    this.activeCombat.isActive = false;
  }

  /**
   * Add message to combat log
   */
  addLog(message) {
    if (this.activeCombat) {
      this.activeCombat.combatLog.push(message);
    }
  }

  /**
   * Get current combat log as formatted string
   */
  getCombatLog() {
    if (!this.activeCombat) return '';
    return this.activeCombat.combatLog.join('<br>');
  }

  /**
   * Check if combat is currently active
   */
  isInCombat() {
    return this.activeCombat?.isActive === true;
  }

  /**
   * Get active enemy (if any)
   */
  getActiveEnemy() {
    return this.activeCombat?.enemy || null;
  }
}
