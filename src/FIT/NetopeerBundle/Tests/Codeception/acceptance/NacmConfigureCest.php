<?php

use FIT\NetopeerBundle\Tests\Codeception\_support\CommonScenarios;

class NacmConfigureCest
{

	public function _before(WebGuy $I)
	{
		CommonScenarios::login($I);
		CommonScenarios::connectToLocalhostDevice($I);
		$I->click('Configure device');
		$I->waitForText('Config & State data', 10);
		$I->canSeeInCurrentUrl('sections/0/interfaces/');
		$I->click('Nacm');
		$I->waitForText('enable-nacm');
		$I->canSeeInCurrentUrl('sections/0/nacm/');
		$I->wait(4);
	}

	public function _after(WebGuy $I)
	{
		$I->amOnPage('/logout');
	}

	public function _addGroups(WebGuy $I, $inputValue) {
		$I->click('.create-child[rel="--*?1!"]');
		CommonScenarios::waitAndClickInTypeahead($I, 'groups');
		$I->click('.create-child', '.generatedForm');
		CommonScenarios::waitAndClickInTypeahead($I, 'group');
		$I->waitForElement('input.value[name*="--*?1!--*?1!--*?1!--*?1!"]');
		$I->fillField('input.value[name*="--*?1!--*?1!--*?1!--*?1!"]', $inputValue);
	}

	public function testEditConfigWithCommit(WebGuy $I) {
		$I->wantTo('create new interface using commit all');

		$inputValue = 'test-name'.time();

		$this->_addGroups($I, $inputValue);
		$I->click('Append changes');

		$I->seeNumberOfElements('form.addedForm', 1);
		$I->click('Commit all changes');
		$I->waitForElementNotVisible('#ajax-spinner');

		$I->wait(2);

		// see result
//		$I->canSee($inputValue);
		CommonScenarios::checkNumberOfFlashes($I, 1);
		$I->canSee('group');
	}

	public function testEditConfig(WebGuy $I) {
		$I->wantTo('create new interface using submit button');
		$inputValue = 'test-name'.time();

		$I->click('.create-child[rel="--*--*?3!"]');
		CommonScenarios::waitAndClickInTypeahead($I, 'group');
		$I->waitForElement('input.value[name*="--*--*?3!--*?1!--*?1!"]');
		$I->fillField('input.value[name*="--*--*?3!--*?1!--*?1!"]', $inputValue);

		$I->click('Create new node');
		$I->waitForElementNotVisible('#ajax-spinner');

		$I->wait(2);

//		$I->canSee($inputValue);
		CommonScenarios::checkNumberOfFlashes($I, 1);
		$I->canSee('group');
	}
}